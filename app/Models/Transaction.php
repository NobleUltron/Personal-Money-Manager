<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'accountId',
        'type',
        'amount',
        'date',
        'reason',
        'category',
    ];

    public function account()
    {
        return $this->belongsTo(Account::class, 'accountId');
    }
}
