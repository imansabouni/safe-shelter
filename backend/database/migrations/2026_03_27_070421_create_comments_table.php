<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    Schema::create('comments', function (Blueprint $table) {
        $table->id();

        $table->foreignId('card_id')->nullable()->constrained()->nullOnDelete();
        $table->foreignId('card_member_id')->nullable()->constrained()->nullOnDelete();

        $table->foreignId('shelter_id')->constrained()->cascadeOnDelete();

        $table->string('name')->nullable();
        $table->integer('rating');

        $table->text('comment')->nullable();

        $table->enum('status', ['pending','approved'])->default('approved');

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
