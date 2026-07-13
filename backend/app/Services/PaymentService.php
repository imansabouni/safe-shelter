<?php

namespace App\Services;

use App\Models\Donation;

class PaymentService
{
    public function createPayment(Donation $donation)
    {
        // Şimdilik mock ödeme linki döndürüyoruz
        return [
            'payment_url' => 'https://payment-provider.com/pay/' . $donation->id,
            'provider_payment_id' => 'MOCK_' . uniqid(),
        ];
    }
}
