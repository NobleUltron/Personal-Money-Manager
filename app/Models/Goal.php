<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Goal extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'target_amount',
        'current_amount',
        'target_date',
        'category',
        'color',
        'notes',
    ];

    protected $casts = [
        'target_amount' => 'float',
        'current_amount' => 'float',
        'target_date' => 'date:Y-m-d',
    ];

    protected $appends = ['percentage', 'is_completed'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getPercentageAttribute()
    {
        if ($this->target_amount <= 0) {
            return 0;
        }
        $percent = ($this->current_amount / $this->target_amount) * 100;
        return min(100, round($percent, 1));
    }

    public function getIsCompletedAttribute()
    {
        return $this->current_amount >= $this->target_amount;
    }
}
