<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UploadDados;



Route::get('/', function () {
    return view('welcome');
});

Route::post('/upload', [UploadDados::class, 'upload'])->name('upload');

