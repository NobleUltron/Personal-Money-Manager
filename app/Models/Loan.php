<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Loan extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'user_id',
        'type',
        'name',
        'amount',
        'amount_paid',
        'due_date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
