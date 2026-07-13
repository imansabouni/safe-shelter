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
    Schema::create('donations', function (Blueprint $table) {

        $table->uuid('id')->primary();

        // 🔥 bağış tipi
        $table->enum('type', ['money', 'resource']);

        // 💰 para bağışı
        $table->decimal('amount', 10, 2)->nullable();

        // 📦 kaynak bağışı
        $table->string('resource_type')->nullable();
        $table->integer('quantity')->nullable();

        // 🏠 sığınak
        $table->unsignedBigInteger('shelter_id')->nullable();
        $table->foreign('shelter_id')
              ->references('id')
              ->on('shelters')
              ->onDelete('set null');

        // 👤 kullanıcı bilgisi
        $table->boolean('is_anonymous')->default(true);
        $table->string('email')->nullable();

        // 💳 ödeme
        $table->enum('payment_status', ['pending', 'success', 'failed'])
              ->default('pending');

        $table->string('provider_payment_id')->nullable();

        $table->timestamps();
    });
}
    public function down(): void
    {
        Schema::dropIfExists('donations');
    }
};
