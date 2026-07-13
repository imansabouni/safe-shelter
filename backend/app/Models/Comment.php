<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = [
        'card_id',
        'card_member_id',
        'shelter_id',
        'name',
        'rating',
        'comment',
        'status'
    ];

    protected $appends = ['display_name'];

    public function card()
    {
        return $this->belongsTo(Card::class);
    }

    public function member()
    {
        return $this->belongsTo(CardMember::class, 'card_member_id');
    }

    public function getDisplayNameAttribute()
    {
        if ($this->card) return $this->card->family_name;
        if ($this->member) return $this->member->name;
        return $this->name ?? 'Anonim';
    }
}