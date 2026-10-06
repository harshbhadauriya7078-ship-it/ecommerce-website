const products = [
  {
    id: 1,
    name: "Aural Pro Headphones",
    category: "Electronics",
    price: 179,
    rating: 4.9,
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Velora Leather Tote",
    category: "Accessories",
    price: 96,
    rating: 4.8,
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Luma Desk Lamp",
    category: "Home",
    price: 64,
    rating: 4.9,
    badge: "Top Rated",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Orbit Smart Watch",
    category: "Electronics",
    price: 199,
    rating: 4.8,
    badge: "Trending",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    name: "Canvas Weekend Tote",
    category: "Accessories",
    price: 42,
    rating: 4.6,
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    name: "Cozy Knit Set",
    category: "Fashion",
    price: 110,
    rating: 4.9,
    badge: "Featured",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 7,
    name: "Breeze Mini Speaker",
    category: "Electronics",
    price: 149,
    rating: 4.7,
    badge: "Hot",
    image:
      "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 8,
    name: "Harbor Mug Set",
    category: "Home",
    price: 36,
    rating: 4.5,
    badge: "Limited",
    image:
      "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
  },
];

const cart = [];
let activeCategory = "All";

const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const subtotalEl = document.getElementById("subtotal");
const cartDrawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const searchInput = document.getElementById("searchInput");
const categoryFilters = document.querySelectorAll(".filter-btn");
const sortSelect = document.getElementById("sortSelect");

function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function saveCart() {
  localStorage.setItem("shopwave-cart", JSON.stringify(cart));
}

function loadCart() {
  const saved = localStorage.getItem("shopwave-cart");
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      cart.push(...parsed);
    }
  } catch (error) {
    console.error("Failed to load cart:", error);
  }
}

function getFilteredProducts() {
  const query = searchInput.value.trim().toLowerCase();
  let filtered = products.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  if (sortSelect.value === "low-high") {
    filtered = filtered.sort((a, b) => a.price - b.price);
  } else if (sortSelect.value === "high-low") {
    filtered = filtered.sort((a, b) => b.price - a.price);
  }

  return filtered;
}

function renderProducts() {
  const filteredProducts = getFilteredProducts();

  if (!filteredProducts.length) {
    productGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; background: white; border: 1px solid var(--border); border-radius: 20px; padding: 52px 24px; text-align: center; color: var(--muted);">
        <h3 style="margin:0 0 8px; color: var(--text);">No products found</h3>
        <p style="margin: 0;">Try another search or category.</p>
      </div>
    `;
    return;
  }

  productGrid.innerHTML = filteredProducts
    .map(
      (product) => `
        <article class="product-card">
          <div class="product-image">
            <span class="product-badge">${product.badge}</span>
            <img src="${product.image}" alt="${product.name}" />
          </div>
          <div class="product-content">
            <div class="product-meta">
              <span>${product.category}</span>
              <span>${product.rating} ★</span>
            </div>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-footer">
              <span class="price">${formatPrice(product.price)}</span>
              <button class="add-btn" data-id="${product.id}">Add</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");

  document.querySelectorAll(".add-btn").forEach((button) => {
    button.addEventListener("click", () => addToCart(Number(button.dataset.id)));
  });
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  updateCart();
  openCart();
}

function removeFromCart(productId) {
  const itemIndex = cart.findIndex((item) => item.id === productId);
  if (itemIndex === -1) return;

  const item = cart[itemIndex];
  if (item.quantity > 1) {
    item.quantity -= 1;
  } else {
    cart.splice(itemIndex, 1);
  }

  saveCart();
  updateCart();
}

function updateCart() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  if (!cart.length) {
    cartItems.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    subtotalEl.textContent = formatPrice(0);
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  subtotalEl.textContent = formatPrice(subtotal);

  cartItems.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" />
          <div class="cart-item-details">
            <h4>${item.name}</h4>
            <span class="cart-item-price">${formatPrice(item.price * item.quantity)}</span>
            <div class="qty-controls">
              <button class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
              <span class="qty-value">${item.quantity}</span>
              <button class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
          </div>
        </div>
      `
    )
    .join("");

  document.querySelectorAll(".qty-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.id);
      const action = button.dataset.action;

      if (action === "increase") {
        addToCart(id);
      } else {
        removeFromCart(id);
      }
    });
  });
}

function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("open");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("open");
}

searchInput.addEventListener("input", renderProducts);
sortSelect.addEventListener("change", renderProducts);

categoryFilters.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    categoryFilters.forEach((btn) => btn.classList.toggle("active", btn === button));
    renderProducts();
  });
});

document.getElementById("cartButton").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (!cart.length) {
    alert("Your cart is empty. Add some products first.");
    return;
  }

  alert("Checkout successful! Your order is being processed.");
  cart.length = 0;
  saveCart();
  updateCart();
  closeCart();
});

loadCart();
renderProducts();
updateCart();
