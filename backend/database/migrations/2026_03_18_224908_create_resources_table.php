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
    Schema::create('resources', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('shelter_id');
        $table->string('type');
        $table->integer('current')->default(0);
        $table->integer('min')->default(0);
        $table->timestamps();
    });
}

public function down()
{
    Schema::dropIfExists('resources');
}
};
