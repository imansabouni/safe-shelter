<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Shelter;

class SecondaryShelter extends Model
{
    protected $fillable = [
        'main_shelter_id',
        'name',
        'district',
        'address',
        'lat',
        'lng',
        'status',
    ];

    public function mainShelter()
    {
        return $this->belongsTo(Shelter::class, 'main_shelter_id');
    }
}
