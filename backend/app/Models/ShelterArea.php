<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShelterArea extends Model
{
    protected $fillable = [
        'shelter_id',
        'name',
        'type',
        'capacity_total',
        'capacity_current',
        'is_active',
    ];

    public function shelter()
    {
        return $this->belongsTo(Shelter::class);
}
}