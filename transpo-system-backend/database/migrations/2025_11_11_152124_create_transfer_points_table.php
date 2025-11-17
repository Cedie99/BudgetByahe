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
    public function up()
    {
        Schema::create('transfer_points', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('barangay');
            $table->string('municipality');
            
            // Use decimal for high-precision coordinates.
            // 10 total digits, 7 after the decimal point (e.g., 120.9767790)
            // This matches the `toFixed(7)` from your React component.
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);

            // This will store 'point' as sent by the form
            $table->string('type')->default('point'); 
            
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
        Schema::dropIfExists('transfer_points');
    }
};