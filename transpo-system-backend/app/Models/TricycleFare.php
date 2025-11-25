<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TricycleFare extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'tricycle_fares';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'place',
        'location',
        'fare',
        'terminal_id', // <-- ADD THIS
        'latitude',    // <-- ADD THIS
        'longitude',   // <-- ADD THIS
    ];
}