<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoutePoint extends Model
{
    use HasFactory;

    protected $fillable = [
        'route_id',
        'order_no',
        'latitude',
        'longitude',
        'barangay_name',
    ];

    /**
     * Get the route that owns the point
     */
    public function route()
    {
        return $this->belongsTo(Route::class);
    }
}
