<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShelterResource extends Model
{
    protected $fillable = [
        'shelter_id',
        'water',
        'food',
        'medicine',
        'blankets'
    ];

    public function shelter()
    {
        return $this->belongsTo(Shelter::class);
    }
}
