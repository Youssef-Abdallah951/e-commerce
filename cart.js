let cart = JSON.parse(localStorage.getItem("cart")) || [];

const container = document.getElementById("cart-items");
const contentWrapper = document.getElementById("cart-content-wrapper");
const emptyState = document.getElementById("empty-state");
const cartBadge = document.getElementById("cart-badge");

// Toast helper
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

// Render Cart Logic
function renderCart() {
    updateBadge();
    if (cart.length === 0) {
        contentWrapper.classList.add("d-none");
        emptyState.classList.remove("d-none");
        return;
    }

    contentWrapper.classList.remove("d-none");
    emptyState.classList.add("d-none");

    container.innerHTML = cart.map((product, index) => {
        const qty = product.quantity || 1;
        return `
            <div class="card p-3 mb-2 rounded-4 border-0 shadow-sm">
                <div class="row align-items-center g-3">
                    <div class="col-3 col-md-2">
                        <img src="${product.image}" class="img-fluid rounded-3" alt="${product.name}">
                    </div>
                    <div class="col-9 col-md-5">
                        <h6 class="fw-bold mb-1">${product.name}</h6>
                        <span class="text-primary fw-semibold">$${product.price}</span>
                    </div>
                    <div class="col-6 col-md-3 d-flex align-items-center gap-2">
                        <button class="btn btn-sm btn-outline-secondary rounded-circle" onclick="updateQty(${index}, -1)" aria-label="Decrease quantity">-</button>
                        <span class="fw-bold px-2">${qty}</span>
                        <button class="btn btn-sm btn-outline-secondary rounded-circle" onclick="updateQty(${index}, 1)" aria-label="Increase quantity">+</button>
                    </div>
                    <div class="col-6 col-md-2 text-end">
                        <button class="btn btn-link text-danger p-0 fs-5" onclick="removeItem(${index})" aria-label="Remove item">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    calculateSummary();
}

// Qty manipulation
function updateQty(index, change) {
    let currentQty = cart[index].quantity || 1;
    currentQty += change;
    
    if (currentQty <= 0) {
        removeItem(index);
    } else {
        cart[index].quantity = currentQty;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    }
}

// Remove single item
function removeItem(index) {
    const name = cart[index].name;
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    showToast(`${name} removed from cart.`, "info");
}

// Calculate cost summary
function calculateSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const shipping = subtotal > 50 ? 0 : 5; // Free shipping on orders over $50 simulation
    const total = subtotal + shipping;

    document.getElementById("subtotal-price").innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById("shipping-price").innerText = shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`;
    document.getElementById("total-price").innerText = `$${total.toFixed(2)}`;
}

// Simulate checkouts
function simulateCheckout() {
    showToast("Processing Payment... Thank you!", "success");
    setTimeout(() => {
        cart = [];
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    }, 2000);
}

function updateBadge() {
    const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    if (cartBadge) {
        cartBadge.innerText = totalCount;
    }
}

// Run setup on load
document.addEventListener("DOMContentLoaded", () => {
    // Theme setup wrapper
    const toggleBtn = document.getElementById("themeToggleBtn");
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        if(toggleBtn) toggleBtn.innerHTML = `<i class="fa-solid fa-sun"></i>`;
    }
    if(toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const isDark = document.body.classList.contains("dark-mode");
            localStorage.setItem("theme", isDark ? "dark" : "light");
            toggleBtn.innerHTML = isDark ? `<i class="fa-solid fa-sun"></i>` : `<i class="fa-solid fa-moon"></i>`;
        });
    }

    renderCart();
});