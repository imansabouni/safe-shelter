<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CardMember extends Model
{
    use HasFactory;

    protected $table = 'card_members';

    protected $fillable = [
        'card_id',
        'name',
        'age',
        'gender',
        'role',
        'health_status',
        'qr_code',
        'has_phone',
        'status',
        'last_location',
        'user_code',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'has_phone' => 'boolean',
    ];

    /**
     * Bu üyenin bağlı olduğu aile kartı
     */
    public function card()
    {
        return $this->belongsTo(Card::class);
    }
    public function entries()
{
    return $this->hasMany(ShelterEntry::class);
}
public function shelter()
{
    return $this->belongsTo(Shelter::class);
}
protected static function booted()
{
    static::deleting(function ($member) {

        ShelterEntry::where('card_member_id',$member->id)
        ->whereNull('exited_at')
        ->update([
            'exited_at'=>now()
        ]);

    });
}

}