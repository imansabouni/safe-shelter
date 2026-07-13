<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResourceRequest extends Model
{   protected $table = 'resource_requests';

    protected $fillable = [
        'shelter_id',
        'type',
        'amount',
        'status'
    ];

    public function shelter()
    {
        return $this->belongsTo(Shelter::class);
    }
}