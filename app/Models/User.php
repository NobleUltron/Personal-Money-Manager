<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $fillable = [
        'username',
        'email',
        'password',
        'profile_picture',
        'currency',
        'currency_symbol',
        'two_factor_enabled',
        'two_factor_code',
        'two_factor_expires_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_code',
    ];

    protected function casts(): array
    {
        return [
            'two_factor_enabled' => 'boolean',
            'two_factor_expires_at' => 'datetime',
        ];
    }

    public function accounts()
    {
        return $this->hasMany(Account::class);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }

    public function goals()
    {
        return $this->hasMany(Goal::class);
    }
}
