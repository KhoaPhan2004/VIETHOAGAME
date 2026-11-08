<?php

use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\UploadController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\InProgressGameController;
use Illuminate\Support\Facades\Route;

Route::get('/games', [GameController::class, 'index']);
Route::get('/games/{slug}', [GameController::class, 'show']);
Route::post('/games', [GameController::class, 'store'])->middleware('throttle:admin-writes');
Route::put('/games/{game}', [GameController::class, 'update'])->middleware('throttle:admin-writes');
Route::delete('/games/{game}', [GameController::class, 'destroy'])->middleware('throttle:admin-writes');
Route::post('/uploads/images', [UploadController::class, 'image'])->middleware('throttle:admin-writes');

Route::get('/in-progress-games', [InProgressGameController::class, 'index']);
Route::get('/in-progress-games/{slug}', [InProgressGameController::class, 'show']);
Route::post('/in-progress-games', [InProgressGameController::class, 'store'])->middleware('throttle:admin-writes');
Route::put('/in-progress-games/{inProgressGame}', [InProgressGameController::class, 'update'])->middleware('throttle:admin-writes');
Route::post('/in-progress-games/{inProgressGame}/release', [InProgressGameController::class, 'markReleased'])->middleware('throttle:admin-writes');
Route::delete('/in-progress-games/{inProgressGame}', [InProgressGameController::class, 'destroy'])->middleware('throttle:admin-writes');

Route::get('/categories', [CategoryController::class, 'index']);
Route::post('/categories', [CategoryController::class, 'store'])->middleware('throttle:admin-writes');
Route::get('/categories/{slug}', [CategoryController::class, 'show']);
Route::put('/categories/{category}', [CategoryController::class, 'update'])->middleware('throttle:admin-writes');
Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->middleware('throttle:admin-writes');

Route::post('/admin/auth/login', [AuthController::class, 'login'])->middleware('throttle:admin-login');
Route::get('/admin/auth/session', [AuthController::class, 'session']);
Route::post('/admin/auth/logout', [AuthController::class, 'logout']);
