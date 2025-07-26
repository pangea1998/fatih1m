<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Shopier'dan gelen POST verilerini al
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Shopier imzasını doğrula (güvenlik için)
$shopier_secret = 'YOUR_SHOPIER_SECRET_KEY';
$signature = hash_hmac('sha256', $input, $shopier_secret);

if (hash_equals($signature, $_SERVER['HTTP_X_SHOPIER_SIGNATURE'] ?? '')) {
    
    if ($data['status'] === 'success') {
        $amount = $data['total_amount'];
        $order_id = $data['random_nr'];
        
        // Başarılı ödeme - frontend'e yönlendir
        $redirect_url = "https://your-site.com/?payment_status=success&amount={$amount}&order_id={$order_id}";
        
        // Log kaydet
        file_put_contents('payments.log', date('Y-m-d H:i:s') . " - Başarılı ödeme: ₺{$amount}\n", FILE_APPEND);
        
    } else {
        // Başarısız ödeme
        $redirect_url = "https://your-site.com/?payment_status=failed";
    }
    
    // Shopier'a yanıt ver
    echo json_encode(['status' => 'ok', 'redirect_url' => $redirect_url]);
    
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid signature']);
}
?>