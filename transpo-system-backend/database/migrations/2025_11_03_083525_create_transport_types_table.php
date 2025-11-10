<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('transport_types', function (Blueprint $table) {
            $table->id();
            $table->enum('name', ['jeepney', 'tricycle'])->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });
        
        // Insert default transport types
        DB::table('transport_types')->insert([
            ['name' => 'jeepney', 'description' => 'Traditional Philippine jeepney transport', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'tricycle', 'description' => 'Motorcycle with sidecar transport', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('transport_types');
    }
};
