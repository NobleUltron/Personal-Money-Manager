<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'category',
        'amount',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
