<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shelter_entries', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('shelter_id')->nullable();
    $table->unsignedBigInteger('card_member_id')->nullable();
    $table->timestamp('entered_at')->nullable();
    $table->timestamp('exited_at')->nullable();
    $table->timestamps();
});
    }

    public function down(): void
    {
        Schema::table('shelter_entries', function (Blueprint $table) {
            $table->dropForeign(['card_member_id']);
            $table->dropColumn('card_member_id');
        });
    }
};