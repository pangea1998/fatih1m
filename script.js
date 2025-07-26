// Global Variables
let currentAmount = 0;
const targetAmount = 300000;

// LocalStorage key
const STORAGE_KEY = 'fatih_destek_progress';

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
    checkURLParameters(); // Ödeme dönüşü kontrolü
});

function initializePage() {
    loadProgressFromStorage();
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

// LocalStorage Functions
function saveProgressToStorage() {
    const progressData = {
        currentAmount: currentAmount,
        lastUpdate: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
}

function loadProgressFromStorage() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const progressData = JSON.parse(stored);
            currentAmount = progressData.currentAmount || 0;
        }
    } catch (error) {
        console.log('Progress yüklenemedi:', error);
        currentAmount = 0;
    }
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

// Cross-browser uyumlu yönlendirme
function redirectToPayment(paymentLink) {
    // Mobil ve farklı tarayıcılar için uyumlu yönlendirme
    if (isMobileOrTablet()) {
        // Mobil cihazlarda aynı sekmede aç
        window.location.href = paymentLink;
    } else {
        // Desktop'ta yeni sekmede aç
        const newWindow = window.open(paymentLink, '_blank');
        
        // Popup engellenirse aynı sekmede aç
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            window.location.href = paymentLink;
        }
    }
}

// Cihaz tespiti
function isMobileOrTablet() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
}

// Telegram tespiti
function isTelegram() {
    return window.Telegram && window.Telegram.WebApp;
}

// Donation Processing - Düzeltilmiş
function processDonation(amount, paymentLink) {
    // Modal'ı kapat
    closeModal();
    
    // Yönlendirme mesajı göster
    showSuccessMessage();
    
    // Ödeme linkine yönlendir
    setTimeout(() => {
        redirectToPayment(paymentLink);
    }, 1500);
    
    // ARTIK OTOMATİK PROGRESS GÜNCELLEME YOK!
    // Progress sadece gerçek ödeme onayı gelince güncellenecek
}

// Gerçek ödeme sonucu işleme
function handlePaymentResult(success, amount) {
    if (success) {
        // Progress güncelle
        currentAmount += amount;
        updateProgressBar();
        updateCurrentAmount();
        saveProgressToStorage(); // LocalStorage'a kaydet
        
        // Başarı bildirimi
        showNotification(`₺${amount} bağışınız için teşekkürler! 🙏`, 'success');
        
        // Confetti efekti (opsiyonel)
        if (typeof confetti !== 'undefined') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    } else {
        // Hata mesajı
        showErrorMessage();
        showNotification('Ödeme işlemi başarısız oldu. Lütfen tekrar deneyiniz.', 'error');
    }
}

// Progress Bar Functions
function updateProgressBar() {
    const percentage = Math.min((currentAmount / targetAmount) * 100, 100);
    
    progressFill.style.width = percentage + '%';
    progressPercentage.textContent = Math.round(percentage) + '%';
    
    // Animasyon
    progressFill.style.transition = 'width 1.5s ease-in-out';
    
    // %100'e ulaşırsa kutlama
    if (percentage >= 100) {
        setTimeout(() => {
            showNotification('🎉 Hedefimize ulaştık! Teşekkürler! 🎉', 'success');
        }, 1600);
    }
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
    // Mevcut bildirimleri temizle
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Yeni bildirim oluştur
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Stiller
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
        font-family: 'Poppins', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    // Animasyon
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Otomatik kaldırma
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// URL Parameter Handling - Gerçek ödeme dönüşü
function checkURLParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status') || urlParams.get('status');
    const amount = urlParams.get('amount') || urlParams.get('total_amount');
    const orderId = urlParams.get('order_id') || urlParams.get('random_nr');
    
    // Shopier'dan dönen parametreleri kontrol et
    if (paymentStatus === 'success' && amount && orderId) {
        // Gerçek ödeme başarılı
        handlePaymentResult(true, parseInt(amount));
        
        // URL'yi temizle
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        
    } else if (paymentStatus === 'failed' || paymentStatus === 'error') {
        // Ödeme başarısız
        handlePaymentResult(false, 0);
        
        // URL'yi temizle
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
}

// Admin fonksiyonları (test için)
function resetProgress() {
    if (confirm('Progress sıfırlansın mı?')) {
        currentAmount = 0;
        updateProgressBar();
        updateCurrentAmount();
        saveProgressToStorage();
        showNotification('Progress sıfırlandı', 'success');
    }
}

// Test için manuel ödeme simülasyonu
function simulatePayment(amount) {
    if (confirm(`₺${amount} ödeme simülasyonu yapılsın mı?`)) {
        handlePaymentResult(true, amount);
    }
}

// Konsol komutları (test için)
window.resetProgress = resetProgress;
window.simulatePayment = simulatePayment;

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

// Resize handler
window.addEventListener('resize', debounce(() => {
    if (modalOverlay.classList.contains('active')) {
        // Modal pozisyonunu ayarla
    }
}, 250));

// Sayfa kapatılırken progress'i kaydet
window.addEventListener('beforeunload', () => {
    saveProgressToStorage();
});

// Telegram Web App desteği
if (isTelegram()) {
    const tg = window.Telegram.WebApp;
    tg.ready();
    
    // Telegram tema renklerini kullan
    if (tg.themeParams.bg_color) {
        document.documentElement.style.setProperty('--tg-bg-color', tg.themeParams.bg_color);
    }
    
    // Ana butonu ayarla
    tg.MainButton.text = 'Bağış Yap';
    tg.MainButton.show();
    
    tg.MainButton.onClick(() => {
        openModal();
    });
}

console.log('🎯 Fatih Destek Sistemi Yüklendi');
console.log('📊 Test komutları: resetProgress(), simulatePayment(miktar)');