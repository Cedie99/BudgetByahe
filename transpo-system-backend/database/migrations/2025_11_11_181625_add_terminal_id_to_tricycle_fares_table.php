<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tricycle_fares', function (Blueprint $table) {
            // ADD THIS LINE:
            // This creates the 'terminal_id' column and links it to the 'terminals' table.
            // 'cascadeOnDelete()' means if you delete a terminal, all its fares are
            // automatically deleted by the database.
            $table->foreignId('terminal_id')->nullable()->constrained('terminals')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tricycle_fares', function (Blueprint $table) {
            // ADD THESE LINES:
            // This properly removes the key and column if you ever roll back.
            $table->dropForeign(['terminal_id']);
            $table->dropColumn('terminal_id');
        });
    }
};