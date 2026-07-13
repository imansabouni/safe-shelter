<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\CardMember;

class Card extends Model
{
    use HasFactory;

   protected $fillable = [
    'user_id',
    'family_code',
    'family_name',
    'is_family',
    'contact_phone',
    'has_pet',
    'pet_type',
    'pet_inside',
    'balance',
    'notes',
    'user_code',
    'latitude',
    'longitude',
];

    protected $casts = [
        'has_pet' => 'boolean',
        'pet_inside' => 'boolean',
        'balance' => 'decimal:2',
    ];

    /**
     * Aile üyeleri
     */
    public function members()
    {
        return $this->hasMany(CardMember::class);
    }

    /**
     * QR giriş çıkış kayıtları
     */
    public function qrLogs()
    {
        return $this->hasMany(QrLog::class);
    }
    public function user()
{
    return $this->belongsTo(AppUser::class, 'user_id');
}

    /**
     * Yardım / bakiye işlemleri
     */
    public function transactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }
    public function shelter()
{
    return $this->belongsTo(Shelter::class);
}
}