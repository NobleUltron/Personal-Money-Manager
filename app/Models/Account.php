<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'name',
        'bank_name',
        'account_number',
        'type',
        'initial_balance',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'accountId');
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class, 'accountId');
    }
}
