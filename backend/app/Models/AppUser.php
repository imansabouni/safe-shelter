<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppUser extends Model
{
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    public function card()
    {
        return $this->hasOne(Card::class);
    }
}