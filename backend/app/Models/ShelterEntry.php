<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShelterEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'shelter_id',
        'type', // entry/exit
        'card_id',
        'card_member_id',
        'entered_at',
        'exited_at'
    ];

    public function shelter()
    {
        return $this->belongsTo(Shelter::class);
    }

    public function card()
    {
        return $this->belongsTo(Card::class);
    }
    public function member()
{
    return $this->belongsTo(CardMember::class,'card_member_id');
}

}