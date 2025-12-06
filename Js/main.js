// ========== API CONFIGURATION ==========
const API_URL = 'https://rosena-fashions-1.onrender.com';
const WHATSAPP_NUMBER = '254737867028';

// ========== PRODUCT DATA ==========
const productsData = [
    { id: 1, name: 'African Shirts', price: 1700, image: 'assets/images/African-shirts from ksh1700.jpeg', description: 'Beautiful traditional African print shirts', category: 'shirts' },
    { id: 2, name: 'Ankara Design Shirt', price: 3000, image: 'assets/images/Ankara-shirts from ksh 3000.jpeg', description: 'Stylish Ankara pattern shirt', category: 'shirts' },
    { id: 3, name: 'Blouse & Skirt', price: 2000, image: 'assets/images/blouse&skirt from Ksh2000.jpeg', description: 'Elegant blouse and skirt set', category: 'sets' },
    { id: 4, name: 'Cinderella Long Dress', price: 4000, image: 'assets/images/Cinderella-dress.jpeg', description: 'Beautiful long dress', category: 'dresses' },
    { id: 5, name: 'Full-Length Abaya Kaftans', price: 2500, image: 'assets/images/Full-Length Abaya Kaftans from Ksh 2500.jpeg', description: 'Elegant full-length kaftans', category: 'kaftans' },
    { id: 6, name: 'Heavy Duty Reflector Jackets', price: 1500, image: 'assets/images/Heavy -duty -reflector jackets from Ksh1500.jpeg', description: 'High-visibility safety jackets', category: 'jackets' },
    { id: 7, name: 'Kaftan Suits', price: 4500, image: 'assets/images/Kaftan- suits from Ksh 4500.jpeg', description: 'Premium kaftan suits', category: 'suits' },
    { id: 8, name: 'Kitenge Shirt', price: 2500, image: 'assets/images/kitenge-shirts from ksh 2500.jpeg', description: 'Traditional kitenge shirts', category: 'shirts' },
    { id: 9, name: 'Ladies Official Jacket', price: 5000, image: 'assets/images/Ladies -official -Jacket from Ksh5000.jpeg', description: 'Professional ladies jacket', category: 'jackets' },
    { id: 10, name: 'Official Kitenge Dress', price: 2000, image: 'assets/images/Official -Kitengedress from Ksh 2000.jpeg', description: 'Formal kitenge dress', category: 'dresses' },
    { id: 11, name: 'Official Shirts', price: 2000, image: 'assets/images/Official -shirts from Ksh2000.jpeg', description: 'Professional office shirts', category: 'shirts' },
    { id: 12, name: 'Official Skirt Suits', price: 5000, image: 'assets/images/official -skirt-suits from Ksh 5000.jpeg', description: 'Complete skirt suit set', category: 'suits' },
    { id: 13, name: 'Official Shirt Dress', price: 1800, image: 'assets/images/Official-shirtdress from Ksh1800.jpeg', description: 'Stylish shirt dress', category: 'dresses' },
    { id: 14, name: 'Princess Round Dress', price: 4000, image: 'assets/images/Princess-round dress from Ksh 4000.jpeg', description: 'Elegant princess dress', category: 'dresses' },
    { id: 15, name: 'School Uniform', price: 1500, image: 'assets/images/School-unifrom  from Ksh 1500.jpeg', description: 'Quality school uniforms', category: 'uniforms' },
    { id: 16, name: 'Shirt Dress', price: 1800, image: 'assets/images/Shirt -Dress from Ksh1800.jpeg', description: 'Casual shirt dress', category: 'dresses' },
    { id: 17, name: 'Kids Wear', price: 1800, image: 'assets/images/Kids-wear.jpg', description: 'Quality children clothing', category: 'kids' },
    { id: 18, name: 'Kitenge Bag', price: 1800, image: 'assets/images/kitenge-bag.jpeg', description: 'Stylish kitenge bags', category: 'accessories' }
];

// ========== GLOBAL STATE ==========
let cart = [];
let currentProductId = null;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadCartFromStorage();
    loadProducts();
    setupEventListeners();
    updateCartDisplay();
}

function setupEventListeners() {
    // Cart overlay click
    const overlay = document.getElementById('cart-overlay');
    if (overlay) {
        overlay.addEventListener('click', toggleCart);
    }

    // Modal close buttons
    const productModalClose = document.querySelector('#product-modal .modal-close');
    const reviewModalClose = document.querySelector('#review-modal .modal-close');
    
    if (productModalClose) {
        productModalClose.addEventListener('click', closeProductModal);
    }
    if (reviewModalClose) {
        reviewModalClose.addEventListener('click', closeReviewModal);
    }

    // Review form
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }

    // Click outside modal to close
    window.addEventListener('click', handleModalOutsideClick);
}

function handleModalOutsideClick(event) {
    const productModal = document.getElementById('product-modal');
    const reviewModal = document.getElementById('review-modal');
    
    if (event.target === productModal) {
        closeProductModal();
    }
    if (event.target === reviewModal) {
        closeReviewModal();
    }
}

// ========== CART MANAGEMENT ==========

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem('rosenaCart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        cart = [];
    }
}

function saveCartToStorage() {
    try {
        localStorage.setItem('rosenaCart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

function addToCart(productId, quantity = 1) {
    const product = productsData.find(p => p.id === parseInt(productId));
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }

    const existingItem = cart.find(item => item.id === parseInt(productId));
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }

    saveCartToStorage();
    updateCartDisplay();
    showNotification(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== parseInt(productId));
    saveCartToStorage();
    updateCartDisplay();
    showNotification('Item removed from cart', 'info');
}

function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === parseInt(productId));
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            saveCartToStorage();
            updateCartDisplay();
        }
    }
}

function clearCart() {
    if (cart.length === 0) {
        showNotification('Cart is already empty', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCartToStorage();
        updateCartDisplay();
        showNotification('Cart cleared', 'info');
    }
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function getCartItemCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

function updateCartDisplay() {
    updateCartBadge();
    updateCartItems();
}

function updateCartBadge() {
    const cartCount = document.getElementById('cart-count');
    if (!cartCount) return;
    
    const itemCount = getCartItemCount();
    cartCount.textContent = itemCount;
    cartCount.style.display = itemCount > 0 ? 'inline-flex' : 'none';
}

function updateCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItemsContainer || !cartTotal) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = 'Ksh 0';
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">Ksh ${item.price.toLocaleString()}</div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        </div>
    `).join('');

    cartTotal.textContent = `Ksh ${getCartTotal().toLocaleString()}`;
}

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function checkoutViaWhatsApp() {
    if (cart.length === 0) {
        showNotification('Your cart is empty! Add some items first.', 'error');
        return;
    }

    let message = '🛍️ *New Order from Rosena Fashion Store*\n\n';
    message += '📦 *Order Details:*\n';
    
    cart.forEach((item, index) => {
        message += `\n${index + 1}. ${item.name}\n`;
        message += `   Price: Ksh ${item.price.toLocaleString()}\n`;
        message += `   Quantity: ${item.quantity}\n`;
        message += `   Subtotal: Ksh ${(item.price * item.quantity).toLocaleString()}\n`;
    });
    
    message += `\n💰 *Total Amount: Ksh ${getCartTotal().toLocaleString()}*\n\n`;
    message += 'Please confirm my order and let me know the delivery details. Thank you!';

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// ========== PRODUCT LOADING ==========

async function loadProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading products...</div>';

    try {
        const response = await fetch(`${API_URL}/api/products`);
        
        let productsWithRatings = [];
        
        if (response.ok) {
            productsWithRatings = await response.json();
        }

        container.innerHTML = '';
        
        productsData.forEach(localProduct => {
            const dbProduct = productsWithRatings.find(p => p.id === localProduct.id);
            const productData = {
                ...localProduct,
                avg_rating: dbProduct ? parseFloat(dbProduct.avg_rating || 0) : 0,
                review_count: dbProduct ? parseInt(dbProduct.review_count || 0) : 0
            };
            
            const productCard = createProductCard(productData);
            container.appendChild(productCard);
        });
    } catch (error) {
        console.error('Error loading products:', error);
        
        // Fallback to local data
        container.innerHTML = '';
        productsData.forEach(product => {
            const productData = { ...product, avg_rating: 0, review_count: 0 };
            const productCard = createProductCard(productData);
            container.appendChild(productCard);
        });
    }
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'gallery-item';

    const avgRating = product.avg_rating || 0;
    const reviewCount = product.review_count || 0;

    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="gallery-item-img">
        <h3>${product.name}</h3>
        <p>From Ksh ${product.price.toLocaleString()}</p>
        
        <div class="product-rating">
            <span class="rating-stars">${generateStars(avgRating)}</span>
            <span class="rating-info">(${avgRating.toFixed(1)}) ${reviewCount} reviews</span>
        </div>

        <div class="quantity-selector">
            <label>Qty:</label>
            <input type="number" class="quantity-input" value="1" min="1" max="99" id="qty-${product.id}">
        </div>

        <div class="product-buttons">
            <button class="whatsapp-btn btn-add-cart" data-product-id="${product.id}">
                🛒 Add to Cart
            </button>
            <button class="whatsapp-btn btn-write-review" data-product-id="${product.id}">
                ⭐ Review
            </button>
        </div>
        <button class="whatsapp-btn btn-view-details" data-product-id="${product.id}">
            View Details & Reviews
        </button>
    `;

    // Add event listeners
    const addToCartBtn = card.querySelector('.btn-add-cart');
    addToCartBtn.addEventListener('click', () => {
        const qtyInput = document.getElementById(`qty-${product.id}`);
        const quantity = parseInt(qtyInput.value) || 1;
        addToCart(product.id, quantity);
    });

    const reviewBtn = card.querySelector('.btn-write-review');
    reviewBtn.addEventListener('click', () => {
        openReviewModal(product.id);
    });

    const detailsBtn = card.querySelector('.btn-view-details');
    detailsBtn.addEventListener('click', () => {
        showProductDetails(product.id);
    });

    return card;
}

// ========== STAR RATING ==========

function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = (rating % 1) >= 0.5;
    let stars = '';

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '★';
        } else if (i === fullStars && hasHalfStar) {
            stars += '⯨';
        } else {
            stars += '☆';
        }
    }

    return stars;
}

// ========== PRODUCT DETAILS MODAL ==========

async function showProductDetails(productId) {
    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');
    
    if (!modal || !modalBody) return;
    
    modalBody.innerHTML = '<div class="loading">Loading product details...</div>';
    modal.classList.add('active');

    const product = productsData.find(p => p.id === parseInt(productId));
    
    if (!product) {
        modalBody.innerHTML = '<p class="error-message">Product not found.</p>';
        return;
    }
    
    try {
        // Fetch product reviews
        const response = await fetch(`${API_URL}/api/reviews/product/${productId}`);
        let reviews = [];
        let avgRating = 0;
        
        if (response.ok) {
            reviews = await response.json();
            
            // Calculate average rating from reviews
            if (reviews.length > 0) {
                const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                avgRating = totalRating / reviews.length;
            }
        }

        modalBody.innerHTML = `
            <div class="product-details-container">
                <div>
                    <img src="${product.image}" alt="${product.name}" class="product-details-image">
                </div>
                <div class="product-details-info">
                    <h2>${product.name}</h2>
                    <p class="product-details-price">Ksh ${product.price.toLocaleString()}</p>
                    
                    <div class="product-rating">
                        <span class="rating-stars">${generateStars(avgRating)}</span>
                        <span class="rating-info">(${avgRating.toFixed(1)}) ${reviews.length} reviews</span>
                    </div>

                    <p class="product-description">${product.description}</p>

                    <div class="quantity-selector">
                        <label>Quantity:</label>
                        <input type="number" class="quantity-input" value="1" min="1" max="99" id="modal-qty-${product.id}">
                    </div>

                    <div class="product-buttons">
                        <button class="btn-add-cart" id="modal-add-cart">
                            🛒 Add to Cart
                        </button>
                        <button class="btn-write-review" id="modal-review-btn">
                            ⭐ Write Review
                        </button>
                    </div>
                </div>
            </div>

            <div class="reviews-section">
                <h3>Customer Reviews (${reviews.length})</h3>
                <div id="product-reviews-container">
                    ${reviews.length > 0 
                        ? reviews.map(review => createReviewHTML(review)).join('') 
                        : '<p class="no-reviews">No reviews yet. Be the first to review this product!</p>'
                    }
                </div>
            </div>
        `;

        // Add event listeners to modal buttons
        const modalAddCartBtn = document.getElementById('modal-add-cart');
        modalAddCartBtn.addEventListener('click', () => {
            const qtyInput = document.getElementById(`modal-qty-${product.id}`);
            const quantity = parseInt(qtyInput.value) || 1;
            addToCart(product.id, quantity);
        });

        const modalReviewBtn = document.getElementById('modal-review-btn');
        modalReviewBtn.addEventListener('click', () => {
            openReviewModal(productId);
        });

    } catch (error) {
        console.error('Error loading product details:', error);
        modalBody.innerHTML = '<p class="error-message">Error loading product details. Please try again.</p>';
    }
}

// ========== FETCH REVIEWS BY PRODUCT ==========

async function fetchReviewsByProduct(productId) {
    try {
        const response = await fetch(`${API_URL}/api/reviews/product/${productId}`);

        
        if (!response.ok) {
            throw new Error('Failed to fetch reviews');
        }
        
        const reviews = await response.json();

        const container = document.getElementById('product-reviews-container');
        if (container) {
            container.innerHTML = reviews.length
                ? reviews.map(review => createReviewHTML(review)).join('')
                : '<p class="no-reviews">No reviews yet. Be the first to review this product!</p>';
        }

        return reviews;
    } catch (error) {
        console.error('Failed to fetch reviews for product:', error);
        const container = document.getElementById('product-reviews-container');
        if (container) {
            container.innerHTML = '<p class="error-message">Failed to load reviews.</p>';
        }
        return [];
    }
}

// ========== CREATE REVIEW HTML ==========

function createReviewHTML(review) {
    const date = new Date(review.created_at);
    const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });

    return `
        <div class="review-item">
            <div class="review-header">
                <span class="review-author">${review.name || 'Anonymous'}</span>
                <span class="review-date">${formattedDate}</span>
            </div>
            <div class="review-rating">${generateStars(review.rating)}</div>
            <p class="review-text">${review.comment}</p>
        </div>
    `;
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// ========== REVIEW MODAL ==========

function openReviewModal(productId) {
    currentProductId = parseInt(productId);
    
    const productIdInput = document.getElementById('review-product-id');
    if (productIdInput) {
        productIdInput.value = productId;
    }
    
    const modal = document.getElementById('review-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    resetReviewForm();
}

async function handleReviewSubmit(e) {
    e.preventDefault();

    const productId = parseInt(document.getElementById('review-product-id').value);
    const customerName = document.getElementById('customer-name').value.trim();
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    const reviewText = document.getElementById('review-text').value.trim();

    // Validation
    if (!ratingInput) {
        showNotification('Please select a rating', 'error');
        return;
    }

    if (!customerName) {
        showNotification('Please enter your name', 'error');
        return;
    }

    if (!reviewText) {
        showNotification('Please enter your review', 'error');
        return;
    }

    const rating = parseInt(ratingInput.value);

    // Prepare data matching backend expectations
    const reviewData = {
        product_id: productId,
        name: customerName,
        rating: rating,
        comment: reviewText
    };

    console.log('Submitting review:', reviewData);

    try {
        const response = await fetch(`${API_URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData)
        });

        const responseData = await response.json();
        console.log('Server response:', responseData);

        if (!response.ok) {
            throw new Error(responseData.message || 'Failed to submit review');
        }

        showNotification('Review submitted successfully! Thank you for your feedback.', 'success');
        
        closeReviewModal();
        
        // Reload products to show updated ratings
        await loadProducts();
        
        // Refresh product details and reviews if modal is open
        const productModal = document.getElementById('product-modal');
        if (productModal && productModal.classList.contains('active')) {
            await fetchReviewsByProduct(productId);
        }

    } catch (error) {
        console.error('Error submitting review:', error);
        showNotification(`Error submitting review: ${error.message}`, 'error');
    }
}

function resetReviewForm() {
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
        reviewForm.reset();
    }
}

// ========== WHATSAPP FUNCTIONS ==========

function openWhatsApp() {
    const message = 'Hello! I would like to inquire about your fashion products.';
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

function sendCustomMessage() {
    const name = document.getElementById('name')?.value;
    const phone = document.getElementById('phone')?.value;
    const message = document.getElementById('message')?.value;

    if (!name || !phone || !message) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    const fullMessage = `Name: ${name}\nPhone: ${phone}\nMessage: ${message}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(fullMessage)}`;
    window.open(url, '_blank');
}

function getDirections() {
    const message = 'Hi! I would like to get directions to your store at Ngumba-Meso Complex shop 35/34, off Thika Road, Nairobi.';
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// ========== FETCH ALL REVIEWS (OPTIONAL) ==========

async function fetchAllReviews() {
    try {
        const response = await fetch(`${API_URL}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch reviews');
        }
        
        const reviews = await response.json();
        console.log('All reviews:', reviews);

        const container = document.getElementById('reviews-container');
        if (container) {
            if (reviews.length === 0) {
                container.innerHTML = '<p>No reviews yet.</p>';
            } else {
                container.innerHTML = reviews.map(r => `
                    <div class="review">
                        <h4>${r.name || 'Anonymous'}</h4>
                        <p>Rating: ${r.rating}/5</p>
                        <p>${r.comment}</p>
                        <small>${new Date(r.created_at).toLocaleDateString()}</small>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Failed to fetch reviews:', error);
    }
}