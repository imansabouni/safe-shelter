<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Donation extends Model
{
    protected $table = 'donations';

    // 🔥 UUID olduğu için
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'type',
        'amount',
        'note',
        'resource_type',
        'quantity',
        'card_id',          // 🔥 EKLE
        'card_member_id',
        'shelter_id',
        'is_anonymous',
        'email',
        'payment_status',
        'provider_payment_id'
    ];

    // 🔥 otomatik UUID üret
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->id) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    protected $appends = ['donor_name'];

public function card()
{
    return $this->belongsTo(\App\Models\Card::class);
}

public function member()
{
    return $this->belongsTo(\App\Models\CardMember::class, 'card_member_id');
}

public function getDonorNameAttribute()
{
    if ($this->card) return $this->card->family_name;
    if ($this->member) return $this->member->name;
    return 'Bilinmeyen Bağışçı';
}
    // 🏠 ilişki
    public function shelter()
    {
        return $this->belongsTo(Shelter::class);
    }
}