<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HelpRequest extends Model
{
    protected $fillable = [
        'card_id',
        'card_member_id',
        'type',
        'note',
        'location',
        'lat',
        'lng',
        'status',
        'priority'
    ];

    public function cardMember()
    {
        return $this->belongsTo(\App\Models\CardMember::class);
    }

public function shelter()
{
    return $this->hasOneThrough(
        \App\Models\Shelter::class,
        \App\Models\GatheringPoint::class,
        'id',          // gathering_points.id
        'id',   
        'card_id',       // shelters.id
        'gathering_point_id',
        'shelter_id'
    );
}
public function transportRequest()
{
    return $this->hasOne(\App\Models\TransportRequest::class);
}
public function card()
{
    return $this->belongsTo(\App\Models\Card::class);
}

protected $casts = [
    'created_at' => 'datetime:Y-m-d H:i:s',
    'updated_at' => 'datetime:Y-m-d H:i:s',
    'started_at' => 'datetime:Y-m-d H:i:s',
    'completed_at' => 'datetime:Y-m-d H:i:s',
];


}

