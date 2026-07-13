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
        Schema::table('resources', function (Blueprint $table) {
            $table->decimal('current', 15, 4)->comment('Kalan miktar (hassas)')->change();
            if (!Schema::hasColumn('resources', 'last_consumed_at')) {
                $table->timestamp('last_consumed_at')->nullable()->after('current');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('resources', function (Blueprint $table) {
            $table->integer('current')->default(0)->change();
            // last_consumed_at can stay if it was added manually earlier, or we can drop it.
        });
    }
};
