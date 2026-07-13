<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transport_requests', function (Blueprint $table) {
            $table->foreignId('help_request_id')
                  ->nullable()
                  ->after('user_id')
                  ->constrained('help_requests')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('transport_requests', function (Blueprint $table) {
            $table->dropForeign(['help_request_id']);
            $table->dropColumn('help_request_id');
        });
    }
};
