<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resource extends Model
{
    protected $fillable = [
        'shelter_id',
        'type',
        'current',
        'min',
        'last_consumed_at'
    ];

    protected $casts = [
        'current' => 'float',
        'min' => 'integer',
        'last_consumed_at' => 'datetime'
    ];
public function shelter()
{
    return $this->belongsTo(\App\Models\Shelter::class, 'shelter_id');
}
}