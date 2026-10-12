/* ==========================================================================
   North Star Bakery - Touchstone 4 JavaScript
   ========================================================================== */

// DATA STRUCTURE 1: Array of Objects (Bakery Product Catalog)
const bakeryCatalog = [
    { id: "sourdough", name: "Country Sourdough", price: 8.00 },
    { id: "baguette", name: "French Baguette", price: 4.00 },
    { id: "wheat", name: "Honey Whole Wheat", price: 7.50 },
    { id: "focaccia", name: "Rosemary Sea Salt Focaccia", price: 6.00 },
    { id: "croissant", name: "Butter Croissant", price: 3.50 },
    { id: "knot", name: "Cardamom Cinnamon Knot", price: 4.50 },
    { id: "danish", name: "Seasonal Fruit Danish", price: 4.25 },
    { id: "bun", name: "Classic Morning Bun", price: 4.00 }
];

// DATA STRUCTURE 2: Object containing custom validation error messages
const validationMessages = {
    nameRequired: "Please enter your full name (at least 2 characters).",
    emailRequired: "Please enter your email address.",
    emailInvalid: "Please enter a valid email format (e.g., name@example.com).",
    messageRequired: "Please enter order details or an inquiry (at least 10 characters).",
    pastDate: "Pickup date cannot be in the past."
};

// Initialize features on page load
document.addEventListener("DOMContentLoaded", () => {
    initWishlist();
    initFormValidation();
    prefillContactForm();
});

/* ==========================================================================
   FEATURE 1 & STORAGE: Pre-Order Wishlist & localStorage Management
   ========================================================================== */

// Helper function to read from localStorage
function getStoredWishlist() {
    const saved = localStorage.getItem("northstar_wishlist");
    return saved ? JSON.parse(saved) : [];
}

// Helper function to save to localStorage
function setStoredWishlist(wishlistArray) {
    localStorage.setItem("northstar_wishlist", JSON.stringify(wishlistArray));
}

// Initialize Wishlist UI and event listeners on products.html
function initWishlist() {
    const wishlistSection = document.getElementById("wishlist-section");
    if (!wishlistSection) return; // Not on products.html

    renderWishlist();

    // Event listener for all "Add to Pre-Order" buttons
    const addButtons = document.querySelectorAll(".add-wishlist-btn");
    addButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            const productId = e.target.getAttribute("data-id");
            addItemToWishlist(productId);
        });
    });
}

// Add item logic
function addItemToWishlist(productId) {
    let currentWishlist = getStoredWishlist();
    const product = bakeryCatalog.find(item => item.id === productId);

    if (product && !currentWishlist.some(item => item.id === productId)) {
        currentWishlist.push(product);
        setStoredWishlist(currentWishlist);
        renderWishlist();
    }
}

// Remove item logic
function removeItemFromWishlist(productId) {
    let currentWishlist = getStoredWishlist();
    currentWishlist = currentWishlist.filter(item => item.id !== productId);
    setStoredWishlist(currentWishlist);
    renderWishlist();
}

// Render Wishlist items dynamically to the DOM
function renderWishlist() {
    const container = document.getElementById("wishlist-items");
    const totalDisplay = document.getElementById("wishlist-total");
    if (!container) return;

    const wishlist = getStoredWishlist();
    container.innerHTML = "";

    if (wishlist.length === 0) {
        container.innerHTML = "<p class='empty-wishlist'>Your wishlist is empty. Click <strong>'+ Add to Pre-Order'</strong> on any item below to start!</p>";
        if (totalDisplay) totalDisplay.textContent = "\$0.00";
        return;
    }

    let runningTotal = 0;
    wishlist.forEach(item => {
        runningTotal += item.price;

        const itemRow = document.createElement("div");
        itemRow.className = "wishlist-item-row";
        itemRow.innerHTML = `
            <span><strong>${item.name}</strong> — $${item.price.toFixed(2)}</span>
            <button type="button" class="btn-remove" data-id="${item.id}">Remove</button>
        `;
        
        // Remove button click listener
        itemRow.querySelector(".btn-remove").addEventListener("click", () => {
            removeItemFromWishlist(item.id);
        });

        container.appendChild(itemRow);
    });

    if (totalDisplay) {
        totalDisplay.textContent = `$${runningTotal.toFixed(2)}`;
    }
}

/* ==========================================================================
   FEATURE 2 & STORAGE: Pre-filling Form Fields across pages
   ========================================================================== */

function prefillContactForm() {
    const detailsTextarea = document.getElementById("item-details");
    const requestTypeSelect = document.getElementById("request-type");
    const noticeBanner = document.getElementById("prefill-notice");

    if (!detailsTextarea) return; // Not on contact.html

    const wishlist = getStoredWishlist();

    if (wishlist.length > 0) {
        const itemNames = wishlist.map(item => item.name).join(", ");
        detailsTextarea.value = `Pre-Order Wishlist Items: ${itemNames}`;
        
        if (requestTypeSelect) {
            requestTypeSelect.value = "preorder";
        }

        if (noticeBanner) {
            noticeBanner.style.display = "block";
            noticeBanner.innerHTML = `<strong>✨ Notice:</strong> We automatically loaded <strong>${wishlist.length} item(s)</strong> from your pre-order wishlist into the details box below!`;
        }
    }
}

/* ==========================================================================
   FEATURE 3: Form Validation and Near-Field Error Messages
   ========================================================================== */

function initFormValidation() {
    const contactForm = document.getElementById("contact-form");
    if (!contactForm) return;

    contactForm.addEventListener("submit", (event) => {
        clearValidationErrors();
        let isValid = true;

        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const detailsInput = document.getElementById("item-details");
        const pickupDateInput = document.getElementById("pickup-date");

        // Check 1: Required Name field (minimum length check)
        if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
            displayError(nameInput, validationMessages.nameRequired);
            isValid = false;
        }

        // Check 2: Email Required & Email Format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+\$/;
        if (!emailInput.value.trim()) {
            displayError(emailInput, validationMessages.emailRequired);
            isValid = false;
        } else if (!emailRegex.test(emailInput.value.trim())) {
            displayError(emailInput, validationMessages.emailInvalid);
            isValid = false;
        }

        // Check 3: Item Details / Message length check
        if (!detailsInput.value.trim() || detailsInput.value.trim().length < 10) {
            displayError(detailsInput, validationMessages.messageRequired);
            isValid = false;
        }

        // Check 4: Pickup Date past check
        if (pickupDateInput && pickupDateInput.value) {
            const selectedDate = new Date(pickupDateInput.value + "T00:00:00");
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate < today) {
                displayError(pickupDateInput, validationMessages.pastDate);
                isValid = false;
            }
        }

        // Prevent submission if validation fails
        if (!isValid) {
            event.preventDefault();
        }
    });
}

function displayError(inputElement, errorMessage) {
    inputElement.classList.add("input-error");

    const parentContainer = inputElement.closest(".form-field") || inputElement.parentElement;
    let errorSpan = parentContainer.querySelector(".field-error-msg");

    if (!errorSpan) {
        errorSpan = document.createElement("span");
        errorSpan.className = "field-error-msg";
        parentContainer.appendChild(errorSpan);
    }

    errorSpan.textContent = errorMessage;
}

function clearValidationErrors() {
    document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
    document.querySelectorAll(".field-error-msg").forEach(el => el.remove());
}
