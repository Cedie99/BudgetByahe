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
        Schema::create('tricycle_fares', function (Blueprint $table) {
            $table->id();
            
            // This column is needed for multiple LGU support
            $table->string('place'); 
            
            $table->string('location');      // For 'Terminal - Green Valley'
            $table->decimal('fare', 8, 2);   // For '20.00'
 
            $table->decimal('latitude', 10, 7); // Destiantion's coordinates 
            $table->decimal('longitude', 10, 7);

            $table->timestamps();
            $table->index('place');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tricycle_fares');
    }
};