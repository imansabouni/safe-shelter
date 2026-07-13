<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shelters', function (Blueprint $table) {
            $table->foreignId('parent_shelter_id')
                  ->nullable()
                  ->constrained('shelters')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('shelters', function (Blueprint $table) {
            $table->dropForeign(['parent_shelter_id']);
            $table->dropColumn('parent_shelter_id');
        });
    }
};
