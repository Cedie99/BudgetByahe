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
        Schema::create('terminals', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('association_name', 150);
            $table->string('barangay', 150);
            $table->string('municipality', 150);
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->foreignId('transport_type_id')->constrained('transport_types')->onDelete('cascade');
            $table->timestamps();
            
            // Indexes for common queries
            $table->index(['municipality', 'barangay']);
            $table->index('transport_type_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('terminals');
    }
};
