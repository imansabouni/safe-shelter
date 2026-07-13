<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
   protected $fillable = [
    'card_id',
    'amount',
    'type',
    'note',
  ];


    public function card()
    {
        return $this->belongsTo(Card::class);
    }
}
