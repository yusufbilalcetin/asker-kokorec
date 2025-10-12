// ================================================================
// 0️⃣ SAYFA YÜKLENİNCE ÇALIŞAN ANA BAŞLATMA FONKSİYONU
// ================================================================
document.addEventListener("DOMContentLoaded", () => {
  initializeTheme();
  loadCartFromStorage();
  renderMenu();
  updateActiveNavLink();
  setupEventListeners();
});

// ================================================================
// 1️⃣ TEMA (GECE / GÜNDÜZ MODU)
// ================================================================
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  if (savedTheme === "dark") document.body.classList.add("dark-mode");
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  const currentTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("theme", currentTheme);
}

// ================================================================
// 2️⃣ MENÜ VERİLERİ
// ================================================================
const menuData = {
  ekmekAralari: [
    { id: 101, name: "Bütün Kokoreç", price: 460, image: "kokorec.jpg" },
    { id: 102, name: "Üç Çeyrek Kokoreç", price: 360, image: "kokorec.jpg" },
    { id: 103, name: "Yarım Kokoreç", price: 230, image: "yarim kokorec.jpg" },
    { id: 104, name: "Çeyrek Kokoreç", price: 160, image: "kokorec.jpg" },
    { id: 105, name: "Bütün Köfte", price: 160, image: "kofte.jpg" },
    { id: 106, name: "Yarım Köfte", price: 110, image: "kofte.jpg" },
    { id: 107, name: "Çeyrek Köfte", price: 70, image: "kofte.jpg" },
    { id: 108, name: "Bütün Sucuk", price: 160, image: "sucuk.jpg" },
    { id: 109, name: "Üç Çeyrek Sucuk", price: 130, image: "sucuk.jpg" },
    { id: 110, name: "Yarım Sucuk", price: 90, image: "sucuk.jpg" },
    { id: 111, name: "Çeyrek Sucuk", price: 60, image: "sucuk.jpg" },
    { id: 112, name: "Bütün Tavuk", price: 160, image: "tavuk.jpg" },
    { id: 113, name: "Üç Çeyrek Tavuk", price: 115, image: "tavuk.jpg" },
    { id: 114, name: "Yarım Tavuk", price: 85, image: "tavuk.jpg" },
    { id: 115, name: "Çeyrek Tavuk", price: 55, image: "tavuk.jpg" },
    { id: 116, name: "Midye (adet)", price: 15, image: "logo.png" },
  ],
  tatlilar: [
    { id: 201, name: "Halka Tatlısı", price: 25, image: "tatli.jpg" },
    { id: 202, name: "Ekler", price: 40, image: "tatli.jpg" },
    { id: 203, name: "Soğuk Baklava", price: 60, image: "tatli.jpg" },
    { id: 204, name: "Şekerpare", price: 60, image: "tatli.jpg" },
  ],
  icecekler: [
    { id: 301, name: "Ayran", price: 15, image: "icecek.jpg" },
    { id: 302, name: "Büyük Ayran", price: 25, image: "icecek.jpg" },
    { id: 303, name: "Kutu Kola", price: 35, image: "icecek.jpg" },
    { id: 304, name: "Şişe Kola", price: 30, image: "icecek.jpg" },
    { id: 305, name: "Su", price: 10, image: "icecek.jpg" },
    { id: 306, name: "Çay", price: 10, image: "logo.png" },
  ],
  cigKofte: [
    { id: 401, name: "Çiğ Köfte Dürüm", price: 35, image: "cigkofte.jpg" },
    { id: 402, name: "Çiğ Köfte Porsiyon", price: 55, image: "cigkofte.jpg" },
  ],
};

const allMenuItems = [].concat(...Object.values(menuData));

// ================================================================
// 3️⃣ MENÜ RENDER FONKSİYONU
// ================================================================
function renderMenu() {
  const main = document.querySelector(".main-content");
  if (!main || !main.dataset.category) return;

  const category = main.dataset.category;
  const container = document.getElementById("menu-container");

  if (container && menuData[category]) {
    container.innerHTML = menuData[category]
      .map(
        (item) => `
        <div class="menu-card">
          <img class="menu-card__image" src="../images/${item.image}" alt="${item.name}">
          <div class="menu-card__content">
            <h3 class="menu-card__title">${item.name}</h3>
            <p class="menu-card__price">${item.price} ₺</p>
            <button class="button button--primary menu-card__button" data-id="${item.id}">Sepete Ekle</button>
          </div>
        </div>`
      )
      .join("");
  }
}

// ================================================================
// 4️⃣ SEPET SİSTEMİ
// ================================================================
let cart = [];
const cartPanel = document.getElementById("cart-panel");
const cartList = document.getElementById("cart-list");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");

function saveCartToStorage() {
  localStorage.setItem("askerKokorecCart", JSON.stringify(cart));
}

function loadCartFromStorage() {
  const saved = localStorage.getItem("askerKokorecCart");
  if (saved) {
    cart = JSON.parse(saved);
    renderCart();
  }
}

function addToCart(id) {
  const item = allMenuItems.find((x) => x.id === id);
  const existing = cart.find((i) => i.id === id);

  if (existing) existing.quantity++;
  else cart.push({ ...item, quantity: 1 });

  renderCart();
  saveCartToStorage();
  openCart();
}

function renderCart() {
  let total = 0;
  let html = "";

  if (cart.length === 0) {
    cartList.innerHTML = `<li class="cart-drawer__empty-message">Sepetiniz boş.</li>`;
  } else {
    cart.forEach((item) => {
      total += item.price * item.quantity;
      html += `
        <li class="cart-item">
          <img class="cart-item__image" src="../images/${item.image}" alt="${item.name}">
          <div class="cart-item__details">
            <span class="cart-item__name">${item.name}</span>
            <span class="cart-item__price">${item.price} ₺</span>
          </div>
          <div class="cart-item__actions">
            <button class="quantity-control__btn" onclick="changeQuantity(${item.id}, -1)">-</button>
            <span class="quantity-control__amount">${item.quantity}</span>
            <button class="quantity-control__btn" onclick="changeQuantity(${item.id}, 1)">+</button>
            <button class="cart-item__remove-btn" onclick="removeFromCart(${item.id})">🗑️</button>
          </div>
        </li>`;
    });
    cartList.innerHTML = html;
  }

  cartTotal.textContent = `${total} ₺`;
  cartCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
}

function changeQuantity(id, delta) {
  const item = cart.find((x) => x.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) removeFromCart(id);
  renderCart();
  saveCartToStorage();
}

function removeFromCart(id) {
  cart = cart.filter((x) => x.id !== id);
  renderCart();
  saveCartToStorage();
}

function openCart() {
  cartPanel.classList.add("open");
}

function closeCart() {
  cartPanel.classList.remove("open");
}

function toggleCart() {
  cartPanel.classList.contains("open") ? closeCart() : openCart();
}

function checkout() {
  if (!cart.length) return alert("Sepetiniz boş!");
  alert(`Siparişiniz alındı! Toplam: ${cartTotal.textContent}`);
  cart = [];
  renderCart();
  saveCartToStorage();
  closeCart();
}

// ================================================================
// 5️⃣ HAMBURGER MENÜ (MOBİL NAV)
// ================================================================
const hamburger = document.createElement("div");
hamburger.className = "hamburger";
hamburger.innerHTML = "<span></span><span></span><span></span>";
document.querySelector(".header__controls").prepend(hamburger);

const nav = document.querySelector(".nav");
hamburger.addEventListener("click", () => {
  nav.classList.toggle("open");
  hamburger.classList.toggle("active");
});

// ================================================================
// 6️⃣ EVENT DİNLEYİCİLERİ
// ================================================================
function setupEventListeners() {
  document.getElementById("theme-toggle-btn")?.addEventListener("click", toggleTheme);
  document.getElementById("cart-toggle-btn")?.addEventListener("click", toggleCart);
  document.getElementById("cart-close-btn")?.addEventListener("click", closeCart);
  document.getElementById("checkout-btn")?.addEventListener("click", checkout);

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".menu-card__button");
    if (btn) addToCart(parseInt(btn.dataset.id));
  });
}

// ================================================================
// 7️⃣ AKTİF NAVİGASYON
// ================================================================
function updateActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav__link").forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.classList.add("nav__link--active");
    }
  });
}
