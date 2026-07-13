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
    Schema::table('email_verifications', function (Blueprint $table) {
        $table->foreignId('user_id')
            ->nullable()
            ->after('id')
            ->constrained('app_users')
            ->onDelete('cascade');

        $table->unique('user_id');
    });
}

public function down(): void
{
    Schema::table('email_verifications', function (Blueprint $table) {
        $table->dropForeign(['user_id']);
        $table->dropUnique(['user_id']);
        $table->dropColumn('user_id');
    });
}
};
