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
    Schema::create('help_requests', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id')->nullable(); // kullanıcı zorunlu değilse
        $table->string('location'); // örnek: "41.0123,28.9876"
        $table->enum('type', ['injured', 'trapped', 'needs_transport', 'other']);
        $table->text('note')->nullable(); // ek açıklama
        $table->enum('status', ['pending', 'in_progress', 'resolved'])->default('pending');
        $table->timestamps();
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('help_requests');
    }
};
