<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invite extends Model
{
    protected $fillable = [
        'email',
        'token',
        'role',
        'used'
    ];
    protected $casts = [
    'used' => 'boolean',
];
}