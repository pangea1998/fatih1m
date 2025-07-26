// Global Variables
let currentAmount = 0;
const targetAmount = 300000;

// DOM Elements
const openModalBtn = document.getElementById('openModalBtn');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');
const amountBtns = document.querySelectorAll('.amount-btn');
const currentAmountEl = document.getElementById('currentAmount');
const progressFill = document.getElementById('progressFill');
const progressPercentage = document.getElementById('progressPercentage');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
});

function initializePage() {
    updateProgressBar();
    formatCurrency();
}

function setupEventListeners() {
    // Modal controls
    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Amount selection
    amountBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const amount = parseInt(this.dataset.amount);
            const link = this.dataset.link;
            processDonation(amount, link);
        });
    });

    // Keyboard events
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Modal Functions
function openModal() {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Donation Processing
function processDonation(amount, paymentLink) {
    // Show success message
    showSuccessMessage();
    
    // Close modal
    closeModal();
    
    // Redirect to payment after a short delay
    setTimeout(() => {
        window.open(paymentLink, '_blank');
        
        // Simulate payment success for demo (in real app, this would come from payment gateway)
        setTimeout(() => {
            handlePaymentResult(true, amount);
        }, 3000);
    }, 1500);
}

function handlePaymentResult(success, amount) {
    if (success) {
        // Update progress
        currentAmount += amount;
        updateProgressBar();
        updateCurrentAmount();
        
        // Show success notification
        showNotification('Bağışınız için teşekkürler!', 'success');
    } else {
        // Show error message
        showErrorMessage();
    }
}

// Progress Bar Functions
function updateProgressBar() {
    const percentage = Math.min((currentAmount / targetAmount) * 100, 100);
    
    progressFill.style.width = percentage + '%';
    progressPercentage.textContent = Math.round(percentage) + '%';
    
    // Add animation class
    progressFill.style.transition = 'width 1.5s ease-in-out';
}

function updateCurrentAmount() {
    currentAmountEl.textContent = formatTurkishLira(currentAmount);
}

// Utility Functions
function formatTurkishLira(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatCurrency() {
    // Format all currency displays
    const currencyElements = document.querySelectorAll('.amount-value');
    currencyElements.forEach(el => {
        if (el.id === 'currentAmount') {
            el.textContent = formatTurkishLira(currentAmount);
        }
    });
}

// Message Functions
function showSuccessMessage() {
    successMessage.classList.add('show');
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 5000);
}

function showErrorMessage() {
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #23d5ab, #23a6d5)' : 'linear-gradient(135deg, #e73c7e, #ee7752)'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        z-index: 3000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Animation Functions
function addPulseAnimation(element) {
    element.style.animation = 'pulse 0.6s ease-in-out';
    setTimeout(() => {
        element.style.animation = '';
    }, 600);
}

// URL Parameter Handling (for payment returns)
function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const amount = urlParams.get('amount');
    
    if (paymentStatus === 'success' && amount) {
        handlePaymentResult(true, parseInt(amount));
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'failed') {
        handlePaymentResult(false, 0);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Initialize URL check on page load
document.addEventListener('DOMContentLoaded', checkURLParameters);

// Smooth scroll for better UX
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// Add loading states
function setLoadingState(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yönlendiriliyor...';
    } else {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-hand-holding-heart"></i><span>Bağış Yap</span>';
    }
}

// Performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add resize handler for responsive adjustments
window.addEventListener('resize', debounce(() => {
    // Adjust modal position if needed
    if (modalOverlay.classList.contains('active')) {
        // Recalculate modal positioning
    }
}, 250));