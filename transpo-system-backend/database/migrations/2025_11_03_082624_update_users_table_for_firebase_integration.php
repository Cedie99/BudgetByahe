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
     * Updates users table to work with Firebase Auth/Firestore
     * Firebase handles: email, firstName, lastName, photoURL, provider, role, uid
     * MySQL only needs: firebase_uid (for linking) and minimal local data
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Add firebase_uid if not exists (linking to Firestore user)
            if (!Schema::hasColumn('users', 'firebase_uid')) {
                $table->string('firebase_uid', 128)->unique()->nullable()->after('id');
            }
            
            // Add role for local reference (synced from Firestore)
            if (!Schema::hasColumn('users', 'role')) {
                $table->enum('role', ['user', 'admin', 'operator'])->default('user')->after('email');
            }
            
            // Add profile photo reference (optional, synced from Firestore)
            if (!Schema::hasColumn('users', 'profile_photo')) {
                $table->string('profile_photo', 255)->nullable()->after('role');
            }
            
            // Add last login tracking
            if (!Schema::hasColumn('users', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable()->after('email_verified_at');
            }
        });
        
        // Make password nullable by modifying the existing users table directly
        DB::statement('ALTER TABLE users MODIFY password VARCHAR(255) NULL');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['firebase_uid', 'role', 'profile_photo', 'last_login_at']);
        });
        
        // Revert password back to NOT NULL
        DB::statement('ALTER TABLE users MODIFY password VARCHAR(255) NOT NULL');
    }
};
