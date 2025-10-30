// admin.js - Firebase ile Çalışan Nihai Sürüm

document.addEventListener('DOMContentLoaded', () => {
    
    // Firebase veritabanı bağlantısını HTML'den alıyoruz
    // (admin-dashboard.html'de 'db' değişkenini global olarak tanımlamıştık)
    if (typeof db === 'undefined') {
        alert("Firebase veritabanı bağlantısı kurulamadı. Lütfen admin-dashboard.html dosyasını kontrol edin.");
        return;
    }

    const app = {
        // =============== STATE MANAGEMENT (DURUM YÖNETİMİ) ===============
        products: [], // Ürünleri Firebase'den çekeceğiz
        orders: [],   // Siparişleri Firebase'den çekeceğiz
        categories: [], // Kategoriler ürünlere göre dinamik oluşacak
        currentView: 'orders',
        orderListener: null, // Siparişleri dinleyecek olan bağlantı
        productListener: null, // Ürünleri dinleyecek olan bağlantı
        
        // =============== DOM ELEMENTS (HTML ELEMENTLERİ) ===============
        elements: {
            navTabs: document.getElementById('nav-tabs'),
            tabContents: document.querySelectorAll('.tab-content'),
            logoutButton: document.getElementById('logout-button'), // Çıkış butonu (Henüz eklemedik ama ID'si bu)
            
            // Siparişler Sekmesi
            ordersTableBody: document.getElementById('orders-table-body'),
            notification: document.getElementById('notification'),
            notificationSound: document.getElementById('notification-sound'),

            // Ürünler Sekmesi
            productSearch: document.getElementById('product-search'),
            productCategoryFilter: document.getElementById('product-category-filter'),
            addProductButton: document.getElementById('add-product-button'),
            productTableBody: document.getElementById('product-table-body'),
            
            // Silinenler Sekmesi
            deletedProductsTableBody: document.getElementById('deleted-products-table-body'),

            // Modal
            modal: document.getElementById('modal'),
        },
        
        // =============== METİN STANDARTLAŞTIRMA (Arama için) ===============
        normalizeText(str) {
            if (!str) return '';
            return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/ı/g, 'i').replace(/İ/g, 'I').toLowerCase();
        },

        // =============== UYGULAMAYI BAŞLATMA ===============
        init() {
            // 1. Olay dinleyicilerini kur
            this.setupEventListeners();
            
            // 2. İlk görünümü ayarla (Siparişler)
            this.renderView('orders');
            
            // 3. Firebase'den verileri DİNLEMEYE başla
            this.listenForOrders();
            this.listenForProducts();
        },

        // =============== OLAY DİNLEYİCİLERİ (EVENT LISTENERS) ===============
        setupEventListeners() {
            this.elements.navTabs?.addEventListener('click', this.handleTabClick.bind(this));
            
            // Ürün filtreleme
            this.elements.productSearch?.addEventListener('input', this.renderProducts.bind(this));
            this.elements.productCategoryFilter?.addEventListener('change', this.renderProducts.bind(this));
            
            // Yeni ürün ekle butonu
            this.elements.addProductButton?.addEventListener('click', () => this.renderProductModal());

            // Modal kapatma
            this.elements.modal.addEventListener('click', e => {
                 if (e.target === this.elements.modal || e.target.closest('.close-modal-btn')) {
                     this.closeModal();
                 }
            });

            // Tablo içindeki dinamik butonlar (Düzenle, Sil, Detay, vb.)
            document.body.addEventListener('click', this.handleDynamicClicks.bind(this));
            
            // Çıkış yap butonu (admin-login.html'e yönlendirir)
            // Not: Gerçek bir oturum yönetimi için Firebase Auth kullanılmalı, 
            // bu şimdilik LocalStorage tabanlı basit bir "çıkış yap" simülasyonu.
            this.elements.logoutButton?.addEventListener('click', () => {
                if (confirm("Çıkış yapmak istediğinize emin misiniz?")) {
                    // Gerçek Firebase Auth kullanmıyorsak, basit bir yönlendirme yaparız.
                    // Eğer admin-login.html'de bir "giriş yaptı" anahtarı koyduysanız
                    // localStorage.removeItem('adminLoggedIn'); 
                    window.location.href = 'admin-login.html'; // veya giriş sayfanızın adı
                }
            });
        },

        // Sekme değiştirme
        handleTabClick(e) {
            const target = e.target.closest('.tab-button');
            if (target) {
                const tabName = target.dataset.tab;
                this.renderView(tabName);
            }
        },
        
        // Dinamik butonlara tıklama (Tüm "data-action" butonları)
        handleDynamicClicks(e) {
            const target = e.target.closest('[data-action]');
            if (!target) return;
            
            const action = target.dataset.action;
            const id = target.dataset.id; // Firebase Document ID'si

            switch(action) {
                case 'view-order': this.renderOrderDetailModal(id); break;
                case 'edit-product': this.renderProductModal(id); break;
                case 'delete-product': this.softDeleteProduct(id); break;
                case 'restore-product': this.restoreProduct(id); break;
                case 'perm-delete-product': this.permanentlyDeleteProduct(id); break;
                case 'toggle-stock': this.toggleAvailability(id); break;
            }
        },

        // =============== GÖRÜNÜM YÖNETİCİSİ (VIEW MANAGER) ===============
        renderView(view) {
            this.currentView = view;
            
            // Tüm sekmeleri gizle, aktifi göster
            this.elements.tabContents.forEach(tc => tc.classList.remove('active'));
            document.getElementById(`tab-${view}`).classList.add('active');

            // Butonların aktif durumunu ayarla
            this.elements.navTabs.querySelectorAll('.tab-button').forEach(tb => {
                tb.classList.toggle('active', tb.dataset.tab === view);
            });

            // İlgili sekmenin içeriğini yeniden çiz
            switch (view) {
                case 'orders': this.renderOrders(); break;
                case 'products': this.renderProducts(); break;
                case 'deleted': this.renderDeletedProducts(); break;
            }
        },

        // =============== SİPARİŞ YÖNETİMİ (FIREBASE) ===============

        listenForOrders() {
            // 'orders' koleksiyonunu dinle, 'createdAt' (oluşturulma tarihi)
            // alanına göre en yeniden eskiye doğru sırala.
            db.collection("orders").orderBy("createdAt", "desc")
              .onSnapshot((querySnapshot) => {
                
                const isInitialLoad = this.orders.length === 0;
                
                this.orders = []; // Sipariş listesini temizle
                querySnapshot.forEach((doc) => {
                    // Firebase'den gelen veriyi ve belge ID'sini al
                    this.orders.push({ id: doc.id, ...doc.data() });
                });

                // Eğer o anda 'orders' sekmesindeysek, tabloyu yenile
                if (this.currentView === 'orders') {
                    this.renderOrders();
                }

                // İlk yükleme değilse ve yeni sipariş gelmişse bildirim göster
                if (!isInitialLoad) {
                    this.showNotification('🔔 Yeni Sipariş Geldi!');
                }
                
            }, (error) => {
                console.error("Siparişler dinlenirken hata oluştu: ", error);
                alert("Sipariş veritabanına bağlanılamadı. Sayfayı yenileyin.");
            });
        },
        
        renderOrders() {
            if (!this.elements.ordersTableBody) return;
            
            // Siparişler dizisini HTML tablo satırlarına dönüştür
            this.elements.ordersTableBody.innerHTML = this.orders.map(order => {
                const total = order.total || 0;
                const customer = order.customer || {};
                
                return `
                    <tr class="${order.status === 'Yeni Sipariş' ? 'new-order-highlight' : ''}">
                        <td>${order.orderNumber || order.id.slice(-6)}</td>
                        <td>${customer.name || 'N/A'}</td>
                        <td>${customer.phone || 'N/A'}</td>
                        <td>${total.toFixed(2)} ₺</td>
                        <td>
                            <select class="status-select" data-id="${order.id}" onchange="app.updateOrderStatus(this)">
                                <option value="Yeni Sipariş" ${order.status === 'Yeni Sipariş' ? 'selected' : ''}>Yeni Sipariş</option>
                                <option value="Hazırlanıyor" ${order.status === 'Hazırlanıyor' ? 'selected' : ''}>Hazırlanıyor</option>
                                <option value="Yola Çıktı" ${order.status === 'Yola Çıktı' ? 'selected' : ''}>Yola Çıktı</option>
                                <option value="Teslim Edildi" ${order.status === 'Teslim Edildi' ? 'selected' : ''}>Teslim Edildi</option>
                                <option value="İptal Edildi" ${order.status === 'İptal Edildi' ? 'selected' : ''}>İptal Edildi</option>
                            </select>
                        </td>
                        <td>
                            <button class="button btn-edit" data-action="view-order" data-id="${order.id}">Detay</button>
                        </td>
                    </tr>
                `;
            }).join('');
            
            // 'onchange'in çalışması için 'app' objesini global 'window'a ekliyoruz
            window.app = this; 
        },

        updateOrderStatus(selectElement) {
            const orderId = selectElement.dataset.id;
            const newStatus = selectElement.value;

            // Firebase'deki ilgili sipariş belgesini güncelle
            db.collection("orders").doc(orderId).update({
                status: newStatus
            })
            .then(() => {
                this.showNotification(`Sipariş #${orderId.slice(-6)} durumu güncellendi.`);
                // Yerel diziyi de güncelle (sayfa yenilemeden görünüm değişsin)
                const order = this.orders.find(o => o.id === orderId);
                if(order) order.status = newStatus;
                this.renderOrders(); // Tabloyu yeniden çiz
            })
            .catch(error => {
                console.error("Sipariş durumu güncellenirken hata: ", error);
                alert("Durum güncellenemedi.");
            });
        },

        // =============== ÜRÜN YÖNETİMİ (FIREBASE) ===============

        listenForProducts() {
            // 'products' koleksiyonunu dinle
            db.collection("products").orderBy("name", "asc")
              .onSnapshot((querySnapshot) => {
                
                this.products = [];
                querySnapshot.forEach((doc) => {
                    this.products.push({ id: doc.id, ...doc.data() });
                });

                // Kategorileri dinamik olarak yeniden oluştur
                this.categories = [...new Set(this.products.map(p => p.category))].sort();
                this.populateCategoryFilter();

                // Hangi sekmedeysek orayı yenile
                this.renderView(this.currentView);
                
            }, (error) => {
                console.error("Ürünler dinlenirken hata oluştu: ", error);
                alert("Ürün veritabanına bağlanılamadı. Sayfayı yenileyin.");
            });
        },
        
        populateCategoryFilter() {
            if (!this.elements.productCategoryFilter) return;
            
            const currentVal = this.elements.productCategoryFilter.value; // Seçili filtreyi koru
            this.elements.productCategoryFilter.innerHTML = '<option value="all">Tüm Kategoriler</option>';
            
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                this.elements.productCategoryFilter.appendChild(option);
            });
            
            this.elements.productCategoryFilter.value = currentVal; // Filtreyi tekrar ayarla
        },

        renderProducts() {
            if (!this.elements.productTableBody) return;
            
            const query = this.normalizeText(this.elements.productSearch.value);
            const selectedCategory = this.elements.productCategoryFilter.value;

            // Sadece 'deleted' alanı false olan (veya olmayan) ürünleri filtrele
            const filteredProducts = this.products.filter(p => {
                const isNotDeleted = !p.deleted;
                const nameMatch = this.normalizeText(p.name).includes(query);
                const categoryMatch = selectedCategory === 'all' || p.category === selectedCategory;
                return isNotDeleted && nameMatch && categoryMatch;
            });
            
            this.elements.productTableBody.innerHTML = filteredProducts
                .map(p => this.createProductTableRowHTML(p))
                .join('');
        },
        
        createProductTableRowHTML(product) {
            return `
                <tr>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${(product.price || 0).toFixed(2)} ₺</td>
                    <td>
                        <span class="status-badge status-${product.available ? 'mcvcut' : 'tukendi'}" 
                              data-action="toggle-stock" 
                              data-id="${product.id}">
                            ${product.available ? 'Mevcut' : 'Tükendi'}
                        </span>
                    </td>
                    <td class="action-buttons">
                        <button class="button btn-edit" data-action="edit-product" data-id="${product.id}">
                            <i class="fas fa-pencil-alt"></i> Düzenle
                        </button>
                        <button class="button btn-delete" data-action="delete-product" data-id="${product.id}">
                            <i class="fas fa-trash"></i> Sil
                        </button>
                    </td>
                </tr>
            `;
        },

        toggleAvailability(productId) {
            const product = this.products.find(p => p.id === productId);
            if (product) {
                const newAvailability = !product.available;
                
                // Firebase'de güncelle
                db.collection("products").doc(productId).update({
                    available: newAvailability
                })
                .then(() => {
                    this.showNotification(`${product.name} durumu güncellendi.`);
                    // Yerel diziyi de anında güncelle (dinleyici zaten yakalar ama
                    // bu daha hızlı hissettirir)
                    product.available = newAvailability;
                    this.renderProducts();
                })
                .catch(e => console.error("Stok durumu güncellenirken hata", e));
            }
        },

        softDeleteProduct(productId) {
            if (!confirm("Bu ürünü silmek istediğinize emin misiniz? Ürün, 'Silinen Ürünler' sekmesine taşınacak.")) return;

            // Firebase'de 'deleted' flag'ini true yap
            db.collection("products").doc(productId).update({
                deleted: true,
                deletedAt: new Date() // Ne zaman silindiğini kaydet
            })
            .then(() => this.showNotification("Ürün silinenlere taşındı."))
            .catch(e => console.error("Ürün silinirken hata", e));
            
            // Dinleyici (listener) değişikliği otomatik yakalayıp 
            // 'products' ve 'deletedProducts' sekmelerini yeniden çizecek.
        },
        
        // =============== SİLİNEN ÜRÜNLER SEKMESİ (FIREBASE) ===============
        renderDeletedProducts() {
            if (!this.elements.deletedProductsTableBody) return;

            // Sadece 'deleted' alanı true olan ürünleri filtrele
            const deleted = this.products.filter(p => p.deleted === true);
            
            this.elements.deletedProductsTableBody.innerHTML = deleted.map(p => `
                <tr>
                    <td>${p.id}</td>
                    <td>${p.name}</td>
                    <td>${p.category}</td>
                    <td class="action-buttons">
                        <button class="button btn-edit" data-action="restore-product" data-id="${p.id}">Geri Yükle</button>
                        <button class="button btn-delete" data-action="perm-delete-product" data-id="${p.id}">Kalıcı Sil</button>
                    </td>
                </tr>
            `).join('');
        },

        restoreProduct(productId) {
            // Firebase'de 'deleted' flag'ini false yap
            db.collection("products").doc(productId).update({
                deleted: false
                // İsteğe bağlı: deletedAt alanını da kaldırabilirsin
                // deletedAt: firebase.firestore.FieldValue.delete() 
            })
            .then(() => this.showNotification("Ürün geri yüklendi."))
            .catch(e => console.error("Ürün geri yüklenirken hata", e));
        },
        
        permanentlyDeleteProduct(productId) {
            if (!confirm("BU İŞLEM GERİ ALINAMAZ! Ürünü veritabanından kalıcı olarak silmek istediğinize emin misiniz?")) return;
            
            // Firebase'den belgeyi tamamen sil
            db.collection("products").doc(productId).delete()
            .then(() => this.showNotification("Ürün kalıcı olarak silindi."))
            .catch(e => console.error("Ürün kalıcı silinirken hata", e));
        },

        // =============== MODAL VE BİLDİRİM FONKSİYONLARI ===============

        renderOrderDetailModal(orderId) {
            const order = this.orders.find(o => o.id === orderId);
            if (!order) return;

            const itemsHTML = order.items.map(item => `
                <li class="summary-item">
                    <div class="summary-item__details">
                        <span class="summary-item__name">${item.quantity}x ${item.name}</span>
                        ${item.options ? `<span class="summary-item__options">${item.options}</span>` : ''}
                    </div>
                    <span class="summary-item__price">${(item.price * item.quantity).toFixed(2)} ₺</span>
                </li>
            `).join('');
            
            const customer = order.customer || {};
            const createdAt = order.createdAt ? order.createdAt.toDate().toLocaleString('tr-TR') : 'Bilinmiyor';

            const html = `
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">Sipariş Detayı: ${order.orderNumber}</h3>
                        <button class="close-modal-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <fieldset>
                            <legend>Müşteri Bilgileri</legend>
                            <p><strong>Ad Soyad:</strong> ${customer.name || 'N/A'}</p>
                            <p><strong>Telefon:</strong> ${customer.phone || 'N/A'}</p>
                            <p><strong>Bölge:</strong> ${customer.zone || 'N/A'}</p>
                            <p><strong>Adres:</strong> ${customer.address || 'N/A'}</p>
                            ${customer.note ? `<p><strong>Not:</strong> ${customer.note}</p>` : ''}
                        </fieldset>
                        <fieldset>
                            <legend>Ürünler</legend>
                            <ul class="checkout-summary">${itemsHTML}</ul>
                        </fieldset>
                        
                        <h4 style="text-align: right; border-top: 1px solid var(--c-border); padding-top: 1rem; margin-top: 1rem;">
                            Toplam Tutar: ${order.total.toFixed(2)} ₺
                        </h4>
                        <p style="text-align: right; font-size: 0.8em; color: var(--c-text-secondary);">
                            Sipariş Tarihi: ${createdAt}
                        </p>
                    </div>
                </div>`;
            this.elements.modal.innerHTML = html;
            this.elements.modal.style.display = 'flex';
        },

        renderProductModal(productId = null) {
            const isEditing = productId !== null;
            const product = isEditing ? this.products.find(p => p.id === productId) : {};
            
            // Opsiyonları (İçindekiler, Acı Seviyesi vb.) oluşturmak için yardımcı fonksiyon
            const renderOptions = (options = []) => {
                // Not: 'product.js' dosyasındaki opsiyon formatı ile script.js'deki farklı olabilir.
                // Biz script.js'nin kullandığı formata (key-value) göre hareket etmeliyiz.
                // Senin script.js'n şu formatı kullanıyor: 
                // options: { "Acı Seviyesi": ['Acısız', 'Az Acılı'], "İçindekiler": [...] }
                
                const optionsObj = product.options || {};
                
                return Object.keys(optionsObj).map((title, groupIndex) => `
                    <div class="option-group" data-group-index="${groupIndex}">
                        <div class="option-group-header">
                            <input type="text" placeholder="Grup Adı (Örn: Acı Seviyesi)" value="${title}" class="option-title-input">
                            
                            <button type="button" class="button btn-delete remove-option-group-btn">&times;</button>
                        </div>
                        <div class="choices-list">
                            ${(optionsObj[title] || []).map((choice) => `
                                <div class="choice-item">
                                    <input type="text" placeholder="Seçenek Adı" value="${choice}" class="choice-name-input">
                                    <button type="button" class="button btn-delete remove-choice-btn">&times;</button>
                                </div>
                            `).join('')}
                        </div>
                        <button type="button" class="button button-add-choice add-choice-btn">+ Seçenek Ekle</button>
                    </div>
                `).join('');
            };

            const modalHTML = `
                <div class="modal product-modal">
                    <div class="modal-header">
                        <h3 class="modal-title">${isEditing ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h3>
                        <button class="close-modal-btn">&times;</button>
                    </div>
                    <form id="product-form">
                        <div class="modal-body">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label>Ürün Adı</label>
                                    <input type="text" name="name" value="${product.name || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label>Fiyat (₺)</label>
                                    <input type="number" name="price" value="${product.price || ''}" required step="0.50">
                                </div>
                                <div class="form-group">
                                    <label>Kategori</label>
                                    <select name="category" required>
                                        <option value="" disabled ${!product.category ? 'selected' : ''}>Kategori Seçin</option>
                                        ${this.categories.map(c => `<option ${c === product.category ? 'selected' : ''}>${c}</option>`).join('')}
                                    </select>
                                    <input type="text" id="new-category-input" placeholder="Veya yeni kategori adı girin...">
                                </div>
                                <div class="form-group">
                                    <label>Stok Durumu</label>
                                    <select name="available">
                                        <option value="true" ${product.available !== false ? 'selected' : ''}>Mevcut</option>
                                        <option value="false" ${product.available === false ? 'selected' : ''}>Tükendi</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Görsel Linki</label>
                                <input type="text" name="image" value="${product.image || ''}" placeholder="Örn: ../images/urun.jpg">
                                <img id="image-preview" src="${product.image || ''}" class="image-preview ${!product.image ? 'hidden' : ''}">
                            </div>
                            
                            <hr style="border-color: var(--c-border); margin: 1.5rem 0;">
                            
                            <h4>İçindekiler & Seçenekler</h4>
                            <div id="options-editor" class="options-editor">${renderOptions(product.options)}</div>
                            <button type="button" id="add-option-group-btn" class="button button-add-choice">+ Yeni Grup Ekle (Örn: Acı Seviyesi)</button>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="button button-secondary close-modal-btn">İptal</button>
                            <button type="submit" class="button" data-id="${product.id || ''}">${isEditing ? 'Güncelle' : 'Kaydet'}</button>
                        </div>
                    </form>
                </div>`;
            
            this.elements.modal.innerHTML = modalHTML;
            this.elements.modal.style.display = 'flex';
            this.initProductFormListeners();
        },
        
        initProductFormListeners() {
            document.getElementById('product-form').addEventListener('submit', this.handleProductFormSubmit.bind(this));
            document.getElementById('add-option-group-btn').addEventListener('click', this.addOptionGroup.bind(this));
            
            const optionsEditor = document.getElementById('options-editor');
            optionsEditor.addEventListener('click', e => {
                if(e.target.matches('.add-choice-btn')) this.addChoiceToGroup(e.target.closest('.option-group'));
                if(e.target.matches('.remove-option-group-btn')) e.target.closest('.option-group').remove();
                if(e.target.matches('.remove-choice-btn')) e.target.closest('.choice-item').remove();
            });

            // Resim linki girildiğinde önizlemeyi göster
            document.querySelector('input[name="image"]').addEventListener('input', e => {
                const preview = document.getElementById('image-preview');
                preview.src = e.target.value;
                preview.classList.toggle('hidden', !e.target.value);
            });
        },

        addOptionGroup() {
            const editor = document.getElementById('options-editor');
            const newGroup = document.createElement('div');
            newGroup.className = 'option-group';
            newGroup.innerHTML = `
                <div class="option-group-header">
                    <input type="text" placeholder="Grup Adı (Örn: Acı Seviyesi)" class="option-title-input">
                    <button type="button" class="button btn-delete remove-option-group-btn">&times;</button>
                </div>
                <div class="choices-list"></div>
                <button type="button" class="button button-add-choice add-choice-btn">+ Seçenek Ekle</button>
            `;
            editor.appendChild(newGroup);
        },

        addChoiceToGroup(groupElement) {
            const list = groupElement.querySelector('.choices-list');
            const newChoice = document.createElement('div');
            newChoice.className = 'choice-item';
            newChoice.innerHTML = `
                <input type="text" placeholder="Seçenek Adı (Örn: Acısız)" class="choice-name-input">
                <button type="button" class="button btn-delete remove-choice-btn">&times;</button>
            `;
            list.appendChild(newChoice);
        },

        async handleProductFormSubmit(e) {
            e.preventDefault();
            
            const form = e.target;
            const submitButton = form.querySelector('button[type="submit"]');
            const productId = submitButton.dataset.id; // Kaydet/Güncelle butonundan ID'yi al
            const isEditing = !!productId;
            
            const formData = new FormData(form);
            
            // Opsiyonları 'script.js'nin anlayacağı { key: value[] } formatına çevir
            const options = {};
            document.querySelectorAll('#options-editor .option-group').forEach(group => {
                const title = group.querySelector('.option-title-input').value.trim();
                if (!title) return;
                
                const choices = Array.from(group.querySelectorAll('.choice-name-input'))
                                     .map(input => input.value.trim())
                                     .filter(Boolean); // Boş seçenekleri atla
                
                if (choices.length > 0) {
                    options[title] = choices;
                }
            });

            // Yeni kategori girilmiş mi kontrol et
            const newCategory = document.getElementById('new-category-input').value.trim();
            const selectedCategory = newCategory || formData.get('category');
            
            if(newCategory && !this.categories.includes(newCategory)) {
                this.categories.push(newCategory);
                // Kategori listesini güncellemeye gerek yok, product listener halledecek
            }
            
            const productData = {
                name: formData.get('name'),
                price: parseFloat(formData.get('price')),
                category: selectedCategory,
                available: formData.get('available') === 'true',
                image: formData.get('image'),
                options: options, // Dönüştürülmüş opsiyon objesi
                deleted: false // Yeni/güncellenen ürünün silinmediğini belirt
            };
            
            // Butonu kilitle
            submitButton.disabled = true;
            submitButton.textContent = 'Kaydediliyor...';
            
            try {
                if (isEditing) {
                    // Güncelleme
                    await db.collection("products").doc(productId).update(productData);
                    this.showNotification("Ürün başarıyla güncellendi.");
                } else {
                    // Yeni Ekleme
                    // Sıralama için bir orderIndex ekleyebiliriz
                    productData.orderIndex = this.products.length + 1; 
                    await db.collection("products").add(productData);
                    this.showNotification("Ürün başarıyla eklendi.");
                }
                
                // Dinleyici (listener) değişikliği otomatik yakalayacak ve
                // tabloyu güncelleyecek. Biz sadece modalı kapatıyoruz.
                this.closeModal();

            } catch (error) {
                console.error("Ürün kaydedilirken hata: ", error);
                alert("Ürün kaydedilemedi. Lütfen tekrar deneyin.");
                submitButton.disabled = false;
                submitButton.textContent = isEditing ? 'Güncelle' : 'Kaydet';
            }
        },

        closeModal() {
            this.elements.modal.style.display = 'none';
            this.elements.modal.innerHTML = '';
        },

        showNotification(message) {
            const el = this.elements.notification;
            if (!el) return;
            
            el.textContent = message;
            el.style.display = 'block'; // Göster
            
            // Ses çal (eğer varsa)
            this.elements.notificationSound?.play().catch(e => console.warn("Bildirim sesi çalınamadı.", e));
            
            // 3 saniye sonra gizle
            setTimeout(() => {
                el.style.display = 'none';
            }, 3000);
        }
    };
    
    // Uygulamayı Başlat
    app.init();
});

document.addEventListener("DOMContentLoaded", () => {
    
    // Gerekli HTML elementlerini seç
    const loginForm = document.getElementById("login-form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorMessage = document.getElementById("error-message");
    const hintMessage = document.getElementById("hint-message");
    const forgotPasswordLink = document.getElementById("forgot-password-link");
    const submitButton = loginForm.querySelector('button[type="submit"]');

    // --- 1. GİRİŞ FORMU İŞLEMCİSİ ---
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Formun sayfayı yenilemesini engelle

            const username = usernameInput.value;
            const password = passwordInput.value;

            // Önceki hataları temizle ve butonu kilitle
            errorMessage.textContent = "";
            hintMessage.textContent = "";
            submitButton.disabled = true;
            submitButton.textContent = "Giriş Yapılıyor...";

            // === GİRİLEN BİLGİLERİ KONTROL ET ===
            // Kullanıcı adı "admin" VE şifre "asker123" mü diye bak
            if (username === "admin" && password === "asker123") {
                
                // Bilgiler doğru, 1 saniye bekleyip yönlendir (isteğe bağlı)
                console.log("Giriş başarılı!");
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html'; // Başarılı olunca yönlendir
                }, 500); // Yarım saniye bekler

            } else {
                
                // Bilgiler yanlış, hata ver.
                console.error("Giriş hatası: Kullanıcı adı veya şifre yanlış.");
                errorMessage.textContent = "Kullanıcı adı veya şifre hatalı.";
                
                // Butonu tekrar aktif et
                submitButton.disabled = false;
                submitButton.textContent = "Giriş Yap";
            }
        });
    }

    // --- 2. ŞİFREMİ UNUTTUM LİNKİ ---
    // Bu link artık Firebase'e bağlı olmadığı için basit bir mesaj gösterelim.
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener("click", (e) => {
            e.preventDefault();
            hintMessage.textContent = ""; // Diğer mesajları temizle
            errorMessage.textContent = "Bu özellik şu anda devre dışıdır.";
        });
    }

    // Hata mesajına tıklanırsa mesajı temizle
    if (errorMessage) {
        errorMessage.addEventListener("click", () => {
            errorMessage.textContent = "";
        });
    }
});