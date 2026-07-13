<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransportRequest extends Model
{
    protected $fillable = [
    'user_id',
    'help_request_id',
    'shelter_id',
    'lat',
    'lng',
    'condition',
    'companions_count',
    'status',
   ];


    public function user() {
        return $this->belongsTo(User::class);
    }

    public function shelter() {
        return $this->belongsTo(Shelter::class);
    }
    public function helpRequest()
{
    return $this->belongsTo(\App\Models\HelpRequest::class);
}

}
