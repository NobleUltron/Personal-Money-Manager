<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'accountId',
        'name',
        'amount',
        'frequency',
        'next_due_date',
        'category',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function account()
    {
        return $this->belongsTo(Account::class, 'accountId');
    }
}
