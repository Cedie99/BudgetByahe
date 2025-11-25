<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('jeepney_fares', function (Blueprint $table) {
            $table->id();
            $table->integer('distance_km');       // For 'Distance (kms.)'
            $table->decimal('regular_fare', 8, 2); // For 'Regular'
            $table->decimal('discounted_fare', 8, 2); // For 'Student / Elderly / Disabled'
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('jeepney_fares');
    }
};