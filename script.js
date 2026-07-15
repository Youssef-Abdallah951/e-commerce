// --- Database of Premium Products ---
const PRODUCTS_DATA = [
    { id: 1, name: "Wireless Noise-Cancelling Headphones", price: 89.99, oldPrice: 129.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", category: "Electronics", badge: "Sale" },
    { id: 2, name: "Smart Fitness Watch Pro", price: 149.99, oldPrice: 199.99, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop", category: "Electronics", badge: "Top Pick" },
    { id: 3, name: "Premium Running Sneakers", price: 79.99, oldPrice: 110.00, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", category: "Shoes", badge: "New" },
    { id: 4, name: "Classic Denim Jacket", price: 64.99, oldPrice: 89.99, image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=400&fit=crop", category: "Fashion", badge: "Top Pick" },
    { id: 5, name: "Leather Crossbody Bag", price: 54.99, oldPrice: 74.99, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop", category: "Accessories", badge: "Sale" },
    { id: 6, name: "Bluetooth Speaker 360°", price: 59.99, oldPrice: 79.99, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop", category: "Electronics", badge: "Sale" }
];

// Initialize cart and wishlist from LocalStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

// --- Dom Elements ---
const productsGrid = document.getElementById("products-grid");
const searchInput = document.getElementById("live-search");
const categoriesContainer = document.getElementById("categories-container");
const sortingSelect = document.getElementById("sorting-select");
const cartBadge = document.getElementById("cart-badge");

// Initialize Setup on Content Loaded
document.addEventListener("DOMContentLoaded", () => {
    updateBadge();
    initTheme();
    if (productsGrid) {
        renderProducts(PRODUCTS_DATA);
        setupEvents();
    }
    setupNewsletter();
});

// --- Theme Toggler & Persistence ---
function initTheme() {
    const toggleBtn = document.getElementById("themeToggleBtn");
    if (!toggleBtn) return;
    
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        toggleBtn.innerHTML = `<i class="fa-solid fa-sun"></i>`;
    }

    toggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isDark = document.body.classList.contains("dark-mode");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        toggleBtn.innerHTML = isDark ? `<i class="fa-solid fa-sun"></i>` : `<i class="fa-solid fa-moon"></i>`;
    });
}

// --- Toast Notifications System ---
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `custom-toast`;
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check text-success' : 'fa-info-circle text-info'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Dynamic Render Products ---
function renderProducts(products) {
    if (!productsGrid) return;
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fa-solid fa-search-minus text-muted fs-1 mb-3"></i>
                <h4 class="text-muted">No products found</h4>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = products.map(product => {
        const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
        const isWishlisted = wishlist.some(item => item.id === product.id);
        const badgeColor = product.badge === "Sale" ? "bg-danger" : (product.badge === "Top Pick" ? "bg-warning text-dark" : "bg-primary");

        return `
            <div class="col-md-6 col-lg-4">
                <div class="product-card h-100 p-3 d-flex flex-column">
                    <div class="product-image-wrapper rounded-3">
                        <span class="badge-badge ${badgeColor}">${product.badge} (-${discount}%)</span>
                        <button class="wishlist-btn ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist(${product.id})" aria-label="Add to wishlist">
                            <i class="${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                        </button>
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                    </div>
                    <div class="mt-3 flex-grow-1 d-flex flex-column">
                        <p class="text-muted fs-7 mb-1">${product.category}</p>
                        <h6 class="fw-bold text-truncate">${product.name}</h6>
                        <div class="d-flex align-items-center gap-1 mb-3 star-rating">
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star"></i>
                            <i class="fa-solid fa-star-half-stroke"></i>
                            <span class="text-muted ms-1 fs-7">(24)</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-end mt-auto">
                            <div>
                                <span class="text-primary fw-bold fs-5">$${product.price.toFixed(2)}</span>
                                <span class="text-decoration-line-through text-muted ms-2 fs-7">$${product.oldPrice.toFixed(2)}</span>
                            </div>
                            <div class="d-flex gap-1">
                                <button class="btn btn-sm btn-outline-secondary rounded-circle" onclick="openQuickView(${product.id})" title="Quick View">
                                    <i class="fa-regular fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-primary rounded-pill px-3" onclick="addToCart('${product.name}', ${product.price}, '${product.image}')">
                                    <i class="fa-solid fa-cart-plus me-1"></i> Add
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const countElem = document.getElementById("products-count");
    if (countElem) countElem.innerText = `${products.length} Products Available`;
}

// --- Setup Realtime Controls ---
function setupEvents() {
    // Live Search
    searchInput.addEventListener("input", filterProducts);

    // Categories Filtering
    categoriesContainer.addEventListener("click", (e) => {
        if (!e.target.matches("button")) return;
        Array.from(categoriesContainer.children).forEach(btn => btn.classList.replace("btn-primary", "btn-outline-secondary"));
        e.target.classList.replace("btn-outline-secondary", "btn-primary");
        filterProducts();
    });

    // Sorting
    sortingSelect.addEventListener("change", filterProducts);
}

function filterProducts() {
    let filtered = [...PRODUCTS_DATA];

    // Category Filter
    const activeCategory = categoriesContainer.querySelector(".btn-primary").getAttribute("data-category");
    if (activeCategory !== "all") {
        filtered = filtered.filter(p => p.category === activeCategory);
    }

    // Search query Filter
    const query = searchInput.value.toLowerCase().trim();
    if (query) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
    }

    // Sort Filter
    const sortVal = sortingSelect.value;
    if (sortVal === "price-low") {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sortVal === "price-high") {
        filtered.sort((a, b) => b.price - a.price);
    }

    renderProducts(filtered);
}

// --- Add To Cart Logic ---
function addToCart(name, price, image) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    // Check if product exists to increase quantity (Simulating actual E-commerce)
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
    } else {
        cart.push({ name, price, image, quantity: 1 });
    }
    
    localStorage.setItem("cart", JSON.stringify(cart));
    updateBadge();
    showToast(`${name} Added to Cart!`, "success");
}

// --- Toggle Wishlist Logic ---
function toggleWishlist(id) {
    const product = PRODUCTS_DATA.find(p => p.id === id);
    const index = wishlist.findIndex(item => item.id === id);

    if (index > -1) {
        wishlist.splice(index, 1);
        showToast("Removed from Wishlist", "info");
    } else {
        wishlist.push(product);
        showToast("Added to Wishlist!", "success");
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    filterProducts();
}

// --- Quick View System ---
function openQuickView(id) {
    const product = PRODUCTS_DATA.find(p => p.id === id);
    if (!product) return;

    document.getElementById("qv-img").src = product.image;
    document.getElementById("qv-name").innerText = product.name;
    document.getElementById("qv-price").innerText = `$${product.price.toFixed(2)}`;
    
    const qvAddBtn = document.getElementById("qv-add-btn");
    qvAddBtn.onclick = () => {
        addToCart(product.name, product.price, product.image);
        bootstrap.Modal.getInstance(document.getElementById("quickViewModal")).hide();
    };

    const modal = new bootstrap.Modal(document.getElementById("quickViewModal"));
    modal.show();
}

// Update Header Cart Badge count
function updateBadge() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    if (cartBadge) {
        cartBadge.innerText = totalCount;
    }
}

// Newsletter
function setupNewsletter() {
    const subscribeBtn = document.getElementById("subscribe-btn");
    const input = document.getElementById("newsletter-input");
    if (subscribeBtn && input) {
        subscribeBtn.addEventListener("click", () => {
            if (input.value.trim() === "") {
                showToast("Please enter a valid email", "info");
            }
            else if(input.value.indexOf('@') === -1 || input.value.indexOf('.') === -1) {
                showToast("Please enter a valid email address", "info");
            }

            else {
                showToast("Thank you for subscribing!", "success");
                input.value = "";
            }
        });
    }
}