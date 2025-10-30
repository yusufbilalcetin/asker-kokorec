/**
 * @file Asker Kokoreç Online Sipariş Scripti
 * @description Müşteriler kapalıyken sepete ekleme yapabilir, ancak siparişi tamamlayamaz.
 */

(() => {
    'use strict';

    // ===================================================================
    // UYGULAMA AYARLARI VE GLOBAL DEĞİŞKENLER
    // ===================================================================
    const config = {
        MINIMUM_ORDER: 350,
        DELIVERY_FEE: 0,
        MAX_ITEM_QUANTITY: 20,
        CATEGORY_ORDER: ['ekmek-arasi', 'tatlilar', 'icecekler', 'cigkofte'],
    };
    let cart = [];
    let phoneInputInstance = null;
    let isShopOpen = false; // Dükkanın durumunu takip etmek için global değişken

    // ===================================================================
    // MENÜ VERİTABANI
    // ===================================================================
    const menuData = [
        // 🥖 Ekmek Arası
        { id: 'butun-kokorec', name: 'Bütün Kokoreç', price: 460, image: '../images/ekmekArasi/ButunKokorec.jpg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] } },
        { id: 'uc-ceyrek-kokorec', name: 'Üç Çeyrek Kokoreç', price: 360, image: '../images/ekmekArasi/ÜcCeyrekKokorec.jpg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] } },
        { id: 'yarim-kokorec', name: 'Yarım Kokoreç', price: 230, image: '../images/ekmekArasi/yarimKokorec.jpg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] } },
        { id: 'ceyrek-kokorec', name: 'Çeyrek Kokoreç', price: 160, image: '../images/ekmekArasi/ceyrekKokorec.jpeg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] } },
        
        { id: 'butun-uykuluk', name: 'Bütün Uykuluk', price: 470, image: '../images/ekmekArasi/butunUykuluk.jpeg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] } },
        { id: 'uc-ceyrek-uykuluk', name: 'Üç Çeyrek Uykuluk', price: 350, image: '../images/ekmekArasi/uykuluk.jpg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] } },
        { id: 'yarim-uykuluk', name: 'Yarım Uykuluk', price: 230, image: '../images/ekmekArasi/uykuluk.jpg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] } },
        { id: 'ceyrek-uykuluk', name: 'Çeyrek Uykuluk', price: 160, image: '../images/ekmekArasi/uykuluk.jpg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] } },
        
        { id: 'butun-kofte', name: 'Bütün Köfte', price: 160, image: '../images/ekmekArasi/ButunKofte.jpg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] }},
        { id: 'yarim-kofte', name: 'Yarım Köfte', price: 110, image: '../images/ekmekArasi/yarimKofte.jpeg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] }},
        { id: 'ceyrek-kofte', name: 'Çeyrek Köfte', price: 70, image: '../images/ekmekArasi/kofte.jpg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] }},
        
        { id: 'butun-sucuk', name: 'Bütün Sucuk', price: 160, image: '../images/ekmekArasi/ButunSucuk.jpeg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] }},
        { id: 'uc-ceyrek-sucuk', name: 'Üç Çeyrek Sucuk', price: 130, image: '../images/ekmekArasi/sucuk.jpg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] }},
        { id: 'yarim-sucuk', name: 'Yarım Sucuk', price: 90, image: '../images/ekmekArasi/sucuk.jpg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] }},
        { id: 'ceyrek-sucuk', name: 'Çeyrek Sucuk', price: 60, image: '../images/ekmekArasi/sucuk.jpg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] }},
        
        { id: 'butun-tavuk', name: 'Bütün Tavuk', price: 160, image: '../images/ekmekArasi/butunTavuk.jpeg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] }},
        { id: 'uc-ceyrek-tavuk', name: 'Üç Çeyrek Tavuk', price: 115, image: '../images/ekmekArasi/tavuk.jpg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] }},
        { id: 'yarim-tavuk', name: 'Yarım Tavuk', price: 85, image: '../images/ekmekArasi/tavuk.jpg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] }},
        { id: 'ceyrek-tavuk', name: 'Çeyrek Tavuk', price: 55, image: '../images/ekmekArasi/tavuk.jpg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] }},
        
        { id: 'butun-ciger', name: 'Bütün Ciğer', price: 160, image: '../images/ekmekArasi/butunCiger.jpeg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] }},
        { id: 'uc-ceyrek-ciger', name: 'Üç Çeyrek Ciğer', price: 130, image: '../images/ekmekArasi/ciger.jpg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] }},
        { id: 'yarim-ciger', name: 'Yarım Ciğer', price: 90, image: '../images/ekmekArasi/ciger.jpg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] }},
        { id: 'ceyrek-ciger', name: 'Çeyrek Ciğer', price: 60, image: '../images/ekmekArasi/ciger.jpeg', category: 'ekmek-arasi', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Az Acılı', 'Bol Acılı'], "İçindekiler": ['Turşu', 'Domates', 'Soğan'] }},
        
        { id: 'midye', name: 'Midye (adet)', price: 15, image: '../images/ekmekArasi/midye.jpeg', category: 'ekmek-arasi' },
        
        // 🍰 Tatlılar
        { id: 'halka-tatlisi', name: 'Halka Tatlısı', price: 25, image: '../images/tatlilar/halkaTatlisi.jpeg', category: 'tatlilar' },
        { id: 'ekler', name: 'Ekler', price: 40, image: '../images/tatlilar/ekler.jpeg', category: 'tatlilar' },
        { id: 'soguk-baklava', name: 'Soğuk Baklava', price: 60, image: '../images/tatlilar/sogukBaklava.jpg', category: 'tatlilar' },
        { id: 'sekerpare', name: 'Şekerpare', price: 60, image: '../images/tatlilar/sekerpare.jpeg', category: 'tatlilar' },
        
        // 🥤 İçecekler
        { id: 'ayran', name: 'Ayran', price: 15, image: '../images/icecekler/kucukAyran.jpeg', category: 'icecekler' },
        { id: 'buyuk-ayran', name: 'Büyük Ayran', price: 25, image: '../images/icecekler/buyukAyran.jpeg', category: 'icecekler' },
        { id: 'kutu-kola', name: 'Kutu Kola', price: 35, image: '../images/icecekler/kutuKola.jpeg', category: 'icecekler' },
        { id: 'sise-kola', name: 'Şişe Kola', price: 30, image: '../images/icecekler/siseKola.jpeg', category: 'icecekler' },
        { id: 'kutu-yedigun', name: 'Kutu Yedigün', price: 30, image: '../images/icecekler/kutuYedigun.jpeg', category: 'icecekler' },
        { id: 'nigde-gazozu', name: 'Niğde Gazozu', price: 30, image: '../images/icecekler/nigdeGazozu.jpeg', category: 'icecekler' },
        { id: 'kutu-fruko', name: 'Kutu Fruko', price: 30, image: '../images/icecekler/kutuFruko.jpeg', category: 'icecekler' },
        { id: 'salgam', name: 'Şalgam', price: 30, image: '../images/icecekler/salgam.jpeg', category: 'icecekler', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Acılı'] }, optionsButtonText: 'Acı Seviyeni Seç' },
        { id: 'ice-tea', name: 'Ice Tea', price: 30, image: '../images/icecekler/iceTea.jpeg', category: 'icecekler' },
        { id: 'meyve-suyu', name: 'Meyve Suyu', price: 30, image: '../images/icecekler/meyveSuyu.jpeg', category: 'icecekler' },
        { id: 'soda', name: 'Soda', price: 20, image: '../images/icecekler/soda.jpeg', category: 'icecekler' },
        { id: 'meyveli-soda', name: 'Meyveli Soda', price: 25, image: '../images/icecekler/meyveliSoda.jpeg', category: 'icecekler', customizable: true, options: { "Aroma": ['Limon', 'Çilek', 'Vişne', 'Elma', 'Şeftali', 'Karpuz'] }, optionsButtonText: 'Aroma Seçimi' },
        { id: '1-lt-kola', name: '1 lt. Kola', price: 45, image: '../images/icecekler/1-lt-kola.jpeg', category: 'icecekler' },
        { id: '2-5-lt-kola', name: '2,5 lt. Kola', price: 70, image: '../images/icecekler/2-5-lt-kola.jpg', category: 'icecekler' },
        { id: 'su', name: 'Su', price: 10, image: '../images/icecekler/su.jpeg', category: 'icecekler' },
        { id: 'cay', name: 'Çay', price: 10, image: '../images/icecekler/cay.jpg', category: 'icecekler' },
        
        // 🌯 Çiğ Köfte
        { id: 'cig-kofte-durum', name: 'Çiğ Köfte Dürüm', price: 70, image: '../images/cigkofte/cigkofteDurum.jpg', category: 'cigkofte', customizable: true, options: { "Acı Seviyesi": ['Acısız', 'Acılı'] } },
        { id: 'cig-kofte-porsiyon', name: 'Çiğ Köfte Porsiyon', price: 175, image: '../images/cigkofte/cigkofte.jpg', category: 'cigkofte' },
    ];

    const UIElements = {
        body: document.body, menuContainer: document.getElementById('menu-container'),
        searchNoResults: document.getElementById('search-no-results'), searchInput: document.getElementById('search-input'),
        statusIndicator: document.getElementById('status-indicator'), statusText: document.getElementById('status-text'),
        cartPanel: document.getElementById('cart-panel'), cartCount: document.getElementById('cart-count'),
        checkoutModal: document.getElementById('checkout-modal'), confirmationModal: document.getElementById('confirmation-modal'),
        overlay: document.getElementById('overlay'), themeToggle: document.getElementById('theme-toggle-checkbox'),
        mainNav: document.getElementById('main-nav'), mobileNavIcon: document.getElementById('mobile-nav-icon'),
    };

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        checkWorkingHours(); 
        setInterval(checkWorkingHours, 60000); 
        loadCartFromStorage();
        renderMenu(); 
        updateCartUI();
        setupEventListeners();
        applyTheme(localStorage.getItem('theme') || 'dark');
    }

    function setupEventListeners() {
        UIElements.themeToggle?.addEventListener('change', (e) => applyTheme(e.target.checked ? 'light' : 'dark'));
        UIElements.searchInput?.addEventListener('input', debounce(() => renderMenu(UIElements.searchInput.value), 300));
        document.body.addEventListener('click', handleDelegatedClicks);
    }

    function handleDelegatedClicks(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        if (e.target.closest('input, label, .iti__country-list, a[href^="#"]')) {
            if (target.matches('a[href^="#"]') && UIElements.mainNav.classList.contains('is-mobile-open')) {
                toggleMobileNav();
            }
            return;
        }
        e.preventDefault();
        const action = target.dataset.action;
        const card = e.target.closest('.product-card');
        switch (action) {
            case 'openCart': openCartPanel(); break;
            case 'closeCart': closeCartPanel(); break;
            case 'clearCart': clearCart(); break;
            case 'closeCheckout': closeCheckout(); break;
            case 'closeConfirmation': closeConfirmation(); break;
            case 'closeAllPanels': closeAllPanels(); break;
            case 'toggleMobileNav': toggleMobileNav(); break;
            case 'toggleOptions': card?.classList.toggle('is-open'); break;
            case 'addToCart': addToCart(card, target); break;
            case 'checkout': openCheckout(); break;
            case 'cartAction': handleCartAction(target.dataset.id, target.dataset.task); break;
        }
    }

    function handleCartAction(itemId, task) {
        const itemIndex = cart.findIndex(item => item.id === itemId);
        if (itemIndex === -1) return;
        const item = cart[itemIndex];
        if (task === 'increment') {
            if (item.quantity < config.MAX_ITEM_QUANTITY) {
                item.quantity++;
            } else {
                alert(`Bir üründen en fazla ${config.MAX_ITEM_QUANTITY} adet sipariş verebilirsiniz.`);
                return;
            }
        } else if (task === 'decrement') {
            item.quantity--;
        }
        if (item.quantity <= 0 || task === 'remove') {
            cart.splice(itemIndex, 1);
            updateCartUI();
        } else {
            updateCartItemDisplay(itemIndex);
            updateTotals();
            saveCartToStorage();
        }
    }

    function updateCartItemDisplay(itemIndex) {
        const item = cart[itemIndex];
        const cartItemElement = UIElements.cartPanel.querySelector(`.cart-item[data-id="${item.id}"]`);
        if (!cartItemElement) return;
        const quantityEl = cartItemElement.querySelector('.cart-item__quantity span');
        const priceEl = cartItemElement.querySelector('.cart-item__price');
        if (quantityEl) {
            quantityEl.classList.add('is-updating');
            quantityEl.textContent = item.quantity;
        }
        if (priceEl) {
            priceEl.classList.add('is-updating');
            priceEl.textContent = `${(item.price * item.quantity).toFixed(0)} ₺`;
        }
        setTimeout(() => {
            quantityEl?.classList.remove('is-updating');
            priceEl?.classList.remove('is-updating');
        }, 300);
    }

    function updateTotals() {
        const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalEl = document.querySelector('.cart-panel__total span');
        if (totalEl) totalEl.textContent = `${totalAmount.toFixed(0)} ₺`;
        UIElements.cartCount.textContent = totalQuantity;
    }

    function updateCartUI() {
        renderCartPanel();
        updateTotals();
        saveCartToStorage();
    }

    function renderMenu(query = '') {
        const skeleton = `<div class="skeleton-loader"><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div></div>`;
        if (!UIElements.menuContainer.querySelector('.skeleton-loader')) UIElements.menuContainer.innerHTML = skeleton;
        const normalizedQuery = normalizeText(query);
        const filteredData = menuData.filter(p => normalizeText(p.name).includes(normalizedQuery));
        UIElements.searchNoResults.style.display = filteredData.length === 0 ? 'block' : 'none';
        const categories = [...new Set(filteredData.map(p => p.category))];
        categories.sort((a, b) => config.CATEGORY_ORDER.indexOf(a) - config.CATEGORY_ORDER.indexOf(b));
        const menuHTML = categories.map(category => {
            const categoryTitles = { 'ekmek-arasi': '🥖 Ekmek Arası', 'icecekler': '🥤 İçecekler', 'cigkofte': '🌯 Çiğ Köfte', 'tatlilar': '🍰 Tatlılar' };
            const productsHTML = filteredData.filter(p => p.category === category).map(createProductCardHTML).join('');
            return `<div id="${category}" class="category-box"><h3 class="category-title">${categoryTitles[category]}</h3><div class="menu-grid">${productsHTML}</div></div>`;
        }).join('');
        UIElements.menuContainer.innerHTML = menuHTML || '';
        checkWorkingHours(); 
    }

    function createProductCardHTML(product) {
    let optionsHTML = '';
    let ingredientsButtonHTML = '';

    if (product.customizable && product.options) {
        let optionsContent = '';
        for (const key in product.options) {
            const isRadio = key.toLowerCase().includes('seviye') || key.toLowerCase().includes('aroma'); // Aroma da radio button olsun diye ekledik
            const type = isRadio ? 'radio' : 'checkbox';
            const nameAttr = `${product.id}-${key.replace(/\s/g, '')}`;
            const choices = product.options[key].map((option, index) => {
                // Acısız, ilk aroma veya genel içindekiler varsayılan seçili olsun
                let isChecked = (isRadio && index === 0) || key === 'İçindekiler';
                return `<label><input type="${type}" name="${nameAttr}" value="${option}" ${isChecked ? 'checked' : ''}> ${option}</label>`;
            }).join('');
            optionsContent += `<div class="option-group"><h5 class="option-title">${key}</h5><div class="choices">${choices}</div></div>`;
        }
        optionsHTML = `<div class="product-card__options">${optionsContent}</div>`;

        // ===================================================================
        // DEĞİŞİKLİK BURADA BAŞLIYOR
        // ===================================================================

        // 1. Ürünün kendi buton metni var mı diye kontrol et, yoksa varsayılanı kullan.
        const buttonText = product.optionsButtonText || 'İçindekiler & Seçenekler';

        // 2. Butonu bu dinamik metin ile oluştur.
        ingredientsButtonHTML = `
            <button type="button" class="ingredients-toggle-btn" data-action="toggleOptions">
                ${buttonText}
                <i class="fas fa-chevron-down"></i>
            </button>
        `;
        // ===================================================================
        // DEĞİŞİKLİK BURADA BİTİYOR
        // ===================================================================
    }

    return `
        <div class="product-card" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}" data-customizable="${!!product.customizable}">
            <div class="product-card__clickable-area">
                <div class="product-card__header">
                    <img src="${product.image}" alt="${product.name}" class="product-card__thumbnail" loading="lazy" />
                    <h4 class="product-card__name">${product.name}</h4>
                </div>
                <p class="product-card__price">${product.price} ₺</p>
            </div>
            ${ingredientsButtonHTML}
            ${optionsHTML}
            <button type="button" class="button product-card__btn" data-action="addToCart">Sepete Ekle</button>
        </div>`;
}

    function renderCartPanel() {
        let content;
        if (cart.length === 0) {
            content = `<div class="cart-panel__header"><h3 class="cart-panel__title">Sepetim</h3><div class="cart-header__actions"><button type="button" class="control-btn" data-action="closeCart">×</button></div></div><div class="cart-empty"><p>Sepetiniz şu anda boş.</p><button type="button" class="button" data-action="closeCart">Alışverişe Başla</button></div>`;
        } else {
            const itemsHTML = cart.map(item => `
                <li class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item__image">
                    <div class="cart-item__details">
                        <h4 class="cart-item__name">${item.name}</h4>
                        ${item.options ? `<p class="cart-item__options">${item.options}</p>` : ''}
                    </div>
                    <div class="cart-item__actions">
                        <div class="cart-item__quantity">
                            <button type="button" class="quantity-btn" data-action="cartAction" data-task="decrement" data-id="${item.id}">−</button>
                            <span>${item.quantity}</span>
                            <button type="button" class="quantity-btn" data-action="cartAction" data-task="increment" data-id="${item.id}">+</button>
                        </div>
                        <p class="cart-item__price">${(item.price * item.quantity).toFixed(0)} ₺</p>
                        <button type="button" class="cart-item__remove-btn" data-action="cartAction" data-task="remove" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </li>`).join('');
            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            content = `<div class="cart-panel__header"><h3 class="cart-panel__title">Sepetim</h3><div class="cart-header__actions"><button type="button" class="control-btn" data-action="closeCart">×</button></div></div><ul class="cart-panel__list">${itemsHTML}</ul><div class="cart-panel__footer"><div class="cart-panel__total"><strong>Toplam:</strong><span>${total.toFixed(0)} ₺</span></div><button type="button" class="cart-footer__clear-btn" data-action="clearCart">Hepsini Kaldır</button><button type="button" class="button button--full-width" data-action="checkout">Siparişi Tamamla</button></div>`;
        }
        UIElements.cartPanel.innerHTML = content;
        checkWorkingHours(); 
    }

    function addToCart(card, button) {
        // --- DÜZENLEME 1: Buradaki kontrol kaldırıldı. ---
        // Artık dükkan kapalıyken de sepete ekleme yapılabilir.
        
        if (!card) return;
        const productData = menuData.find(p => p.id === card.dataset.id);
        let uniqueId = productData.id;
        let optionsString = '';
        if (card.dataset.customizable === 'true' && productData.options) {
            const options = [];
            for (const key in productData.options) {
                const selected = Array.from(card.querySelectorAll(`input[name*="${key.replace(/\s/g, '')}"]:checked`)).map(i => i.value);
                if (selected.length > 0) options.push(selected.join(', '));
            }
            optionsString = options.join('; ');
            uniqueId = `${productData.id}-${optionsString}`;
        }
        const existingItem = cart.find(item => item.id === uniqueId);
        if (existingItem) {
            if (existingItem.quantity < config.MAX_ITEM_QUANTITY) {
                existingItem.quantity++;
            } else {
                alert(`Bir üründen en fazla ${config.MAX_ITEM_QUANTITY} adet sipariş verebilirsiniz.`);
                return;
            }
        } else {
            cart.push({ name: productData.name, price: productData.price, image: productData.image, options: optionsString, id: uniqueId, quantity: 1 });
        }
        updateCartUI();
        button.textContent = '✔ Eklendi!';
        button.classList.add('is-added');
        setTimeout(() => {
            // --- DÜZENLEME 2: Buton yazısı artık her zaman 'Sepete Ekle' olarak döner. ---
            button.textContent = 'Sepete Ekle';
            button.classList.remove('is-added');
        }, 1500);
        if (card.dataset.customizable === 'true') card.classList.remove('is-open');
    }

    function clearCart() { if (confirm('Sepetinizdeki tüm ürünleri silmek istediğinizden emin misiniz?')) { cart = []; updateCartUI(); } }

    function openCheckout() {
        // Bu kontrol kritik ve olduğu gibi kalıyor.
        // Dükkan kapalıysa ödeme ekranı açılmayacak.
        if (!isShopOpen) {
            alert('Üzgünüz, şu anda kapalıyız ve sipariş alamıyoruz.');
            return;
        }
        if (cart.length === 0) return;
        closeAllPanels();
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const total = subtotal + config.DELIVERY_FEE;
        UIElements.checkoutModal.innerHTML = `<div class="modal"><button type="button" class="modal__close-btn" data-action="closeCheckout">×</button><div class="modal__content"><h3 class="modal__name">Sipariş Bilgileri</h3><form id="checkout-form"><fieldset><legend>Sipariş Özeti</legend><div class="checkout-summary">${cart.map(item => `<div class="summary-item"><div class="summary-item__details"><span class="summary-item__name">${item.quantity}x ${item.name}</span>${item.options ? `<span class="summary-item__options">${item.options}</span>` : ''}</div><span class="summary-item__price">${(item.price * item.quantity).toFixed(0)} ₺</span></div>`).join('')}</div></fieldset><fieldset><legend>Teslimat Bilgileri</legend><div id="min-order-warning" class="min-order-warning" style="display: none;"></div><div class="form-grid"><div><label for="customer-name">Ad Soyad</label><input type="text" id="customer-name" required></div><div><label for="customer-phone">Telefon</label><input type="tel" id="customer-phone" required></div><div><label for="delivery-zone">Bölge</label><select id="delivery-zone" required><option value="" disabled selected>Seçiniz</option><option>Serdivan</option><option>Adapazarı</option><option>Erenler</option></select></div><div><label for="customer-address">Adres</label><textarea id="customer-address" rows="3" required></textarea></div><div><label for="order-note">Sipariş Notu (isteğe bağlı)</label><textarea id="order-note" rows="2" placeholder="Örn: Zil bozuk, gelince arayın."></textarea></div></div></fieldset><fieldset><legend>Ödeme Yöntemi</legend><div class="payment-method"><i class="fas fa-money-bill-wave"></i><span>Kapıda Nakit Ödeme</span></div></fieldset><div class="checkout-total"><strong>Genel Toplam:</strong><span>${total.toFixed(0)} ₺</span></div><button type="submit" class="button button--full-width">Sipariş Ver</button></form></div></div>`;
        const phoneInputField = document.getElementById('customer-phone');
        phoneInputInstance = window.intlTelInput(phoneInputField, { initialCountry: "tr", preferredCountries: ["tr"], separateDialCode: true, utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.13/js/utils.js", });
        const warningEl = document.getElementById('min-order-warning');
        const submitBtn = document.getElementById('checkout-form').querySelector('button[type="submit"]');
        if (subtotal < config.MINIMUM_ORDER) {
            warningEl.textContent = `Minimum sipariş tutarı ${config.MINIMUM_ORDER} ₺'dir. Lütfen ${(config.MINIMUM_ORDER - subtotal).toFixed(0)} ₺ daha ekleyin.`;
            warningEl.style.display = 'block';
            submitBtn.disabled = true;
        }
        document.getElementById('checkout-form').addEventListener('submit', handleOrderSubmit);
        UIElements.checkoutModal.classList.add('is-open');
        UIElements.overlay.classList.add('is-visible');
    }

    function handleOrderSubmit(e) { 
        e.preventDefault(); 
        
        // Bu son güvenlik kontrolü de olduğu gibi kalıyor.
        if (!isShopOpen) {
            alert('Üzgünüz, siz siparişi tamamlarken dükkan kapandı. Siparişiniz alınamadı.');
            closeCheckout(); 
            return; 
        }

        if (phoneInputInstance && !phoneInputInstance.isValidNumber()) { 
            alert('Lütfen geçerli bir telefon numarası giriniz.'); 
            return; 
        } 
        const orderDetails = { 
            customer: { 
                name: document.getElementById('customer-name').value, 
                phone: phoneInputInstance ? phoneInputInstance.getNumber() : document.getElementById('customer-phone').value, 
                zone: document.getElementById('delivery-zone').value, 
                address: document.getElementById('customer-address').value, 
                note: document.getElementById('order-note').value 
            }, 
            items: cart, 
            total: cart.reduce((s, i) => s + i.price * i.quantity, 0) + config.DELIVERY_FEE, 
        }; 
        console.log("SİPARİŞ DETAYLARI:", orderDetails); 
        closeCheckout(); 
        showConfirmationModal(); 
        cart = []; 
        updateCartUI(); 
    }

    function showConfirmationModal() { const orderNumber = Math.floor(1000 + Math.random() * 9000); UIElements.confirmationModal.innerHTML = `<div class="modal"><div class="modal__content confirmation-content"><div class="icon"><i class="fas fa-check-circle"></i></div><h3>Siparişiniz Alındı!</h3><p>Sipariş Numaranız: <strong id="order-number">#${orderNumber}</strong></p><p>Tahmini teslimat süresi 30-45 dakikadır.</p><button type="button" class="button" data-action="closeConfirmation">Harika!</button></div></div>`; UIElements.confirmationModal.classList.add('is-open'); UIElements.overlay.classList.add('is-visible'); }

    function checkWorkingHours() {
        const h = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Istanbul" })).getHours();
        const isOpen = (h >= 12) || (h < 3);

        isShopOpen = isOpen; 

        UIElements.statusIndicator.classList.toggle('open', isOpen);
        UIElements.statusIndicator.classList.toggle('closed', !isOpen);
        UIElements.statusText.textContent = isOpen ? 'Açık' : 'Kapalı';

        // --- DÜZENLEME 3: "Sepete Ekle" butonlarını kontrol eden bölüm kaldırıldı. ---
        // Artık bu butonlar her zaman aktif olacak.
        
        const checkoutButton = UIElements.cartPanel.querySelector('[data-action="checkout"]');
        if (checkoutButton) {
            checkoutButton.disabled = !isOpen;
            checkoutButton.textContent = isOpen ? 'Siparişi Tamamla' : 'Şu Anda Sipariş Almıyoruz';
        }
    }

    function toggleMobileNav() { UIElements.mainNav.classList.toggle('is-mobile-open'); UIElements.mobileNavIcon.classList.toggle('fa-bars'); UIElements.mobileNavIcon.classList.toggle('fa-times'); }
    function normalizeText(text) { return text.toLowerCase().replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ı/g, 'i').replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g'); }
    const debounce = (func, delay) => { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), delay); }; };
    function openCartPanel() { UIElements.cartPanel.classList.add('is-open'); UIElements.overlay.classList.add('is-visible'); }
    function closeCartPanel() { UIElements.cartPanel.classList.remove('is-open'); if (!UIElements.checkoutModal.classList.contains('is-open') && !UIElements.confirmationModal.classList.contains('is-open')) UIElements.overlay.classList.remove('is-visible'); }
    function closeCheckout() { UIElements.checkoutModal.classList.remove('is-open'); if (!UIElements.confirmationModal.classList.contains('is-open')) UIElements.overlay.classList.remove('is-visible'); }
    function closeConfirmation() { UIElements.confirmationModal.classList.remove('is-open'); UIElements.overlay.classList.remove('is-visible'); }
    function closeAllPanels() { closeCartPanel(); closeCheckout(); closeConfirmation(); }
    function saveCartToStorage() { localStorage.setItem("askerCart", JSON.stringify(cart)); }
    function loadCartFromStorage() { cart = JSON.parse(localStorage.getItem("askerCart")) || []; }
    function applyTheme(theme) { UIElements.body.classList.toggle('dark-mode', theme === 'dark'); if (UIElements.themeToggle) UIElements.themeToggle.checked = theme !== 'dark'; localStorage.setItem('theme', theme); }

})();

// Dosyanın en başına Firebase konfigürasyonunu ekleyin
// Az önce Firebase'den kopyaladığınız kodu buraya yapıştırın
const firebaseConfig = {
  apiKey: "SIZIN_API_KEYINIZ",
  authDomain: "SIZIN_AUTH_DOMAININIZ",
  projectId: "SIZIN_PROJE_IDNIZ",
  storageBucket: "SIZIN_STORAGE_BUCKETINIZ",
  messagingSenderId: "SIZIN_MESSAGING_SENDER_IDNIZ",
  appId: "SIZIN_APP_IDNIZ"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ... dosyanızın geri kalanı aynı kalacak ...

// handleOrderSubmit fonksiyonunu bulun ve içini aşağıdaki gibi değiştirin:
async function handleOrderSubmit(e) {
    e.preventDefault();

    if (!isShopOpen) {
        alert('Üzgünüz, siz siparişi tamamlarken dükkan kapandı. Siparişiniz alınamadı.');
        closeCheckout();
        return;
    }

    if (phoneInputInstance && !phoneInputInstance.isValidNumber()) {
        alert('Lütfen geçerli bir telefon numarası giriniz.');
        return;
    }

    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const orderDetails = {
        orderNumber: `#${orderNumber}`,
        customer: {
            name: document.getElementById('customer-name').value,
            phone: phoneInputInstance ? phoneInputInstance.getNumber() : document.getElementById('customer-phone').value,
            zone: document.getElementById('delivery-zone').value,
            address: document.getElementById('customer-address').value,
            note: document.getElementById('order-note').value
        },
        items: cart,
        total: cart.reduce((s, i) => s + i.price * i.quantity, 0) + config.DELIVERY_FEE,
        status: 'Yeni Sipariş', // Siparişin durumu
        createdAt: new Date() // Sipariş tarihi
    };

    // Butonu devre dışı bırak ve "Gönderiliyor..." yaz
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sipariş Gönderiliyor...';

    try {
        // Firestore'a siparişi ekle
        await db.collection("orders").add(orderDetails);
        
        console.log("Sipariş başarıyla veritabanına kaydedildi:", orderDetails);
        
        closeCheckout();
        showConfirmationModal(orderNumber); // Sipariş numarasını moda'le gönder
        cart = [];
        updateCartUI();

    } catch (error) {
        console.error("Sipariş kaydedilirken hata oluştu: ", error);
        alert("Siparişiniz gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sipariş Ver';
    }
}


// showConfirmationModal fonksiyonunu sipariş numarasını alacak şekilde güncelleyin
function showConfirmationModal(orderNumber) {
    UIElements.confirmationModal.innerHTML = `<div class="modal"><div class="modal__content confirmation-content"><div class="icon"><i class="fas fa-check-circle"></i></div><h3>Siparişiniz Alındı!</h3><p>Sipariş Numaranız: <strong id="order-number">#${orderNumber}</strong></p><p>Tahmini teslimat süresi 30-45 dakikadır.</p><button type="button" class="button" data-action="closeConfirmation">Harika!</button></div></div>`;
    UIElements.confirmationModal.classList.add('is-open');
    UIElements.overlay.classList.add('is-visible');
}
