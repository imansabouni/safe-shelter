<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transport_requests', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
            ->nullable()
            ->constrained()
            ->nullOnDelete();


            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);

            $table->string('condition');
            $table->integer('companions_count')->default(0);

            $table->enum('status', ['new', 'accepted', 'on_the_way', 'completed'])
                  ->default('new');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transport_requests');
    }
};
