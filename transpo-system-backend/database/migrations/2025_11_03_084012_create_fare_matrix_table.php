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
        Schema::create('fare_matrix', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transport_type_id')->constrained('transport_types')->onDelete('cascade');
            $table->decimal('base_fare', 8, 2);
            $table->decimal('base_distance_km', 8, 2);
            $table->decimal('per_km_rate', 8, 2);
            $table->date('effective_date');
            $table->string('source_document', 255)->nullable()->comment('URL/path to official fare matrix document');
            $table->string('municipality', 150)->nullable()->comment('For LGU-specific fare matrices');
            $table->timestamps();
            
            // Indexes for fare lookups
            $table->index(['transport_type_id', 'effective_date']);
            $table->index('municipality');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('fare_matrix');
    }
};
