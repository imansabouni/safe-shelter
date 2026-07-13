<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AreaAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'card_id',
        'area_id',
        'people_count',
    ];

    /**
     * هذا التوزيع تابع لأي كرت (عائلة)
     */
    public function card()
    {
        return $this->belongsTo(Card::class);
    }

    /**
     * هذا التوزيع تابع لأي Area داخل الملجأ
     */
    public function area()
    {
        return $this->belongsTo(ShelterArea::class, 'area_id');
    }
}
