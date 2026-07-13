<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnregisteredEntry extends Model
{
    protected $fillable = [
        'shelter_id',
        'people_count',
        'notes'
    ];

    public function shelter()
    {
        return $this->belongsTo(Shelter::class);
    }
}