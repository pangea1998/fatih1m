document.addEventListener('DOMContentLoaded', function() {
    // DOM elementlerini seçme
    const progressBar = document.getElementById('progressBar');
    const currentAmountElement = document.getElementById('currentAmount');
    const targetAmountElement = document.getElementById('targetAmount');
    const donateButton = document.getElementById('donateButton');
    const paymentModal = document.getElementById('paymentModal');
    const closeModal = document.getElementById('closeModal');
    const amountOptions = document.querySelectorAll('.amount-option');
    const customAmountInput = document.getElementById('customAmount');
    
    // Hedef ve mevcut bağış miktarları
    const targetAmount = 300000; // 300.000 TL
    let currentAmount = 0;
    
    // Sayfa yüklendiğinde hedef miktarı formatlı olarak göster
    targetAmountElement.textContent = formatCurrency(targetAmount);
    updateProgressBar();
    
    // Bağış butonuna tıklandığında modal'ı göster
    donateButton.addEventListener('click', function() {
        paymentModal.style.display = 'flex';
        resetAmountSelection();
    });
    
    // Modal'ı kapatma
    closeModal.addEventListener('click', function() {
        paymentModal.style.display = 'none';
    });
    
    // Modal dışına tıklandığında kapatma
    window.addEventListener('click', function(event) {
        if (event.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });
    
    // Miktar seçeneklerine tıklandığında doğrudan ödeme sayfasına yönlendir
    amountOptions.forEach(option => {
        option.addEventListener('click', function() {
            const amount = parseInt(this.getAttribute('data-amount'));
            if (amount > 0) {
                // Modal'ı kapat
                paymentModal.style.display = 'none';
                // Shopier ödeme sayfasına yönlendir
                redirectToIyzico(amount);
            }
        });
    });
    
    // Özel miktar alanı için olan event listener'ı kaldırıyoruz
    // customAmountInput event listener kodu silinecek
    customAmountInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            const amount = parseInt(this.value);
            if (amount > 0) {
                // Modal'ı kapat
                paymentModal.style.display = 'none';
                // iyzico ödeme sayfasına yönlendir
                redirectToIyzico(amount);
            } else {
                alert('Lütfen geçerli bir bağış miktarı girin.');
            }
        }
    });
    
    // Artık bağış onaylama butonu kullanılmıyor, doğrudan miktar seçildiğinde ödeme sayfasına yönlendiriliyor
    
    // Bağış ekleme fonksiyonu
    function addDonation(amount) {
        currentAmount += amount;
        updateProgressBar();
    }
    
    // İlerleme çubuğunu güncelleme fonksiyonu
    function updateProgressBar() {
        // İlerleme yüzdesini hesapla (maksimum %100)
        const progressPercentage = Math.min((currentAmount / targetAmount) * 100, 100);
        
        // İlerleme çubuğunu güncelle
        progressBar.style.width = `${progressPercentage}%`;
        
        // Mevcut miktarı güncelle
        currentAmountElement.textContent = formatCurrency(currentAmount);
    }
    
    // Para birimini formatlama fonksiyonu
    function formatCurrency(amount) {
        return new Intl.NumberFormat('tr-TR').format(amount);
    }
    
    // Miktar seçimini sıfırlama
    function resetAmountSelection() {
        amountOptions.forEach(opt => opt.classList.remove('selected'));
        customAmountInput.value = '';
    }
    
    // Shopier ödeme sayfasına yönlendirme fonksiyonu
    function redirectToIyzico(amount) {
        // Bağış yapıldığında ilerleme çubuğunu güncelle
        addDonation(amount);
        
        // Shopier ödeme sayfası URL'si
        let shopierUrl;
        switch(amount) {
            case 200:
                shopierUrl = 'https://www.shopier.com/37920879';
                break;
            case 500:
                shopierUrl = 'https://www.shopier.com/37921650';
                break;
            case 1000:
                shopierUrl = 'https://www.shopier.com/37921678';
                break;
            case 5000:
                shopierUrl = 'https://www.shopier.com/37921691';
                break;
            default:
                shopierUrl = 'https://www.shopier.com/37920879'; // Varsayılan olarak 200 TL linki
        }
        
        // Animasyon efekti ile kullanıcıya işlemin devam ettiğini göster
        const donateButton = document.getElementById('donateButton');
        const originalText = donateButton.textContent;
        donateButton.textContent = 'Yönlendiriliyor...';
        donateButton.style.opacity = '0.7';
        donateButton.disabled = true;
        
        // Ödeme sayfasına yönlendirmeden önce kısa bir animasyon göster
        setTimeout(() => {
            // Doğrudan shopierUrl'yi kullan
            
            // Yeni bir sekmede ödeme sayfasını aç
            window.open(shopierUrl, '_blank');
            
            // Kullanıcıya bilgi mesajı göster
            const formattedAmount = formatCurrency(amount);
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = `
                <div class="success-icon">✓</div>
                <h3>${formattedAmount} TL tutarındaki bağışınız için teşekkür ederiz!</h3>
                <p>Ödeme sayfasına yönlendirildiniz.</p>
            `;
            
            document.querySelector('.container').appendChild(successMessage);
            
            // Mesajı 5 saniye sonra kaldır
            setTimeout(() => {
                successMessage.classList.add('fade-out');
                setTimeout(() => {
                    successMessage.remove();
                    donateButton.textContent = originalText;
                    donateButton.style.opacity = '1';
                    donateButton.disabled = false;
                }, 500);
            }, 4500);
        }, 800);
    }
    
    // Rastgele bir işlem ID'si oluştur
    function generateTransactionId() {
        return 'BAGIS_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
    }
});

// Shopier ödeme sayfasına yönlendirme fonksiyonu
function redirectToShopier(amount) {
    // Bağış yapıldığında ilerleme çubuğunu güncelle
    addDonation(amount);
    
    // Shopier ödeme sayfası URL'leri
    let shopierUrl;
    switch(amount) {
        case 200:
            shopierUrl = 'https://www.shopier.com/37920879';
            break;
        case 500:
            shopierUrl = 'https://www.shopier.com/37921650';
            break;
        case 1000:
            shopierUrl = 'https://www.shopier.com/37921678';
            break;
        case 5000:
            shopierUrl = 'https://www.shopier.com/37921691';
            break;
        default:
            shopierUrl = 'https://www.shopier.com/37920879'; // Varsayılan olarak 200 TL linki
    }
    
    // Animasyon efekti ile kullanıcıya işlemin devam ettiğini göster
    const donateButton = document.getElementById('donateButton');
    const originalText = donateButton.textContent;
    donateButton.textContent = 'Yönlendiriliyor...';
    donateButton.style.opacity = '0.7';
    donateButton.disabled = true;
    
    // Ödeme sayfasına yönlendirmeden önce kısa bir animasyon göster
    setTimeout(() => {
        // Yeni bir sekmede ödeme sayfasını aç
        window.open(shopierUrl, '_blank');
        
        // Kullanıcıya bilgi mesajı göster
        const formattedAmount = formatCurrency(amount);
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div class="success-icon">✓</div>
            <h3>${formattedAmount} TL tutarındaki bağışınız için teşekkür ederiz!</h3>
            <p>Ödeme sayfasına yönlendirildiniz.</p>
        `;
        
        document.querySelector('.container').appendChild(successMessage);
        
        // Mesajı 5 saniye sonra kaldır
        setTimeout(() => {
            successMessage.classList.add('fade-out');
            setTimeout(() => {
                successMessage.remove();
                donateButton.textContent = originalText;
                donateButton.style.opacity = '1';
                donateButton.disabled = false;
            }, 500);
        }, 4500);
    }, 800);
}
    
    // Rastgele bir işlem ID'si oluştur
    function generateTransactionId() {
        return 'BAGIS_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
    }
});