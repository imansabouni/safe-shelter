<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ShelterController;
use App\Http\Controllers\HelpRequestController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\TransportRequestController;
use App\Http\Controllers\AreaAssignmentController;
use App\Http\Controllers\SecondaryShelterController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\DonationController;
use App\Http\Controllers\UnregisteredEntryController;
use App\Http\Controllers\ShelterResourceController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\ResourceController;
//use App\Http\Controllers\QrController;
use App\Http\Controllers\InviteController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\FamilyAuthController;
use App\Http\Controllers\ConnectionController;


/*
|--------------------------------------------------------------------------
| ALL API ROUTES ARE PUBLIC (Bitirme Projesi İçin Tüm Korumalar Kaldırıldı)
|--------------------------------------------------------------------------
*/

Route::post('/friends/add', [ConnectionController::class, 'addFriend']);
Route::get('/friends/{code}', [ConnectionController::class, 'getFriends']);
Route::post('/send-email-code', [FamilyAuthController::class, 'sendEmailCode']);

Route::post('/verify-email-code', [FamilyAuthController::class, 'verifyEmailCode']);
Route::post('/resend-email-code', [FamilyAuthController::class, 'resendEmailCode']);
Route::post('/register-family-owner', [FamilyAuthController::class, 'registerFamilyOwner']);
Route::post('/join-family', [FamilyAuthController::class, 'joinFamily']);
Route::post('/login-family-member', [FamilyAuthController::class, 'loginFamilyMember']);
Route::post('/login-family-owner', [FamilyAuthController::class, 'loginFamilyOwner']);

// AUTH (Giriş/Kayıt hâlâ duruyor ama koruma için zorunlu değil)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::get('/me', [AuthController::class, 'me']);
Route::post('/logout', [AuthController::class, 'logout']);

// HELP REQUESTS
Route::get('/help-requests', [HelpRequestController::class, 'index']);
Route::post('/help-requests', [HelpRequestController::class, 'store']);
Route::get('/help-requests/filter', [HelpRequestController::class, 'filter']);
Route::get('/help-requests/{id}', [HelpRequestController::class, 'show']);
Route::get('/help-requests/{id}/details', [HelpRequestController::class, 'details']);
Route::put('/help-requests/{id}', [HelpRequestController::class, 'update']);

// SHELTERS
Route::get('/shelters', [ShelterController::class, 'index']);
Route::get('/shelters/nearby', [ShelterController::class, 'nearby']);
Route::get('/shelters/{id}', [ShelterController::class, 'show']);
Route::post('/shelters', [ShelterController::class, 'store']);
Route::put('/shelters/{id}', [ShelterController::class, 'update']);
Route::delete('/shelters/{id}', [ShelterController::class, 'destroy']);

// SECONDARY SHELTERS
Route::get('/secondary-shelters', [SecondaryShelterController::class, 'index']);
Route::get('/secondary-shelters/by-neighborhood', [SecondaryShelterController::class, 'byNeighborhood']);

// CARDS & WALLET & MEMBERS
Route::get('/cards', [CardController::class, 'index']);
Route::get('/cards/{id}', [CardController::class, 'show']);
Route::get('/cards/{id}/status', [CardController::class, 'status']);
Route::post('/cards', [CardController::class, 'store']);
Route::put('/cards/{id}', [CardController::class, 'update']);
Route::post('/cards/{id}/add-balance', [CardController::class, 'addBalance']);
Route::post('/cards/{id}/spend', [CardController::class, 'spend']);
Route::post('/cards/{card_id}/members', [CardController::class, 'addMember']);
Route::delete('/cards/{card_id}/members/{member_id}', [CardController::class, 'deleteMember']);
Route::put('/cards/{card_id}/members/{member_id}/status', [CardController::class, 'updateMemberStatus']);
Route::put('/cards/{card_id}/members/{member_id}/location', [CardController::class, 'updateMemberLocation']);

// CONNECTIONS & FRIENDS & LOCATION
Route::get('/friends/search/{code}', [CardController::class, 'searchUser']);
Route::post('/location/update', [CardController::class, 'updateLocation']);
Route::post('/card/health-status', [CardController::class, 'updateHealthStatus']);

// DONATIONS
Route::post('/donations', [DonationController::class, 'store']);
Route::get('/donations', [DonationController::class, 'index']);

// COMMENTS
Route::get('/comments', [CommentController::class, 'index']);
Route::post('/comments', [CommentController::class, 'store']);

// QR LOGS & SCANNING
Route::post('/scan-qr', [CardController::class, 'scanQr']);
Route::get('/qr-logs', [ShelterController::class, 'getLogs']);
Route::post('/shelter/enter', [ShelterController::class, 'enter']);
Route::post('/shelter/exit', [ShelterController::class, 'exit']);

// TRANSPORT
Route::post('/transport-requests', [TransportRequestController::class, 'store']);
Route::get('/transport-requests', [TransportRequestController::class, 'index']);
Route::put('/transport-requests/{id}', [TransportRequestController::class, 'update']);

// ASSIGNMENTS & RESOURCES
Route::post('/area-assignments', [AreaAssignmentController::class, 'store']);
Route::get('/resources', [ShelterResourceController::class, 'getResources']);
Route::get('/shelter-resources', [ShelterResourceController::class, 'index']);
Route::get('/requests', [ShelterResourceController::class, 'requests']);
Route::put('/requests/{id}/approve', [ShelterResourceController::class, 'approveRequest']);
Route::post('/send-resource', [ShelterResourceController::class, 'send']);

// UNREGISTERED ENTRIES
Route::get('/unregistered', [UnregisteredEntryController::class, 'index']);
Route::post('/unregistered', [UnregisteredEntryController::class, 'store']);
Route::put('/unregistered/{id}', [UnregisteredEntryController::class, 'update']);
Route::delete('/unregistered/{id}', [UnregisteredEntryController::class, 'destroy']);

// NOTIFICATIONS & INVITES
Route::get('/notifications', [NotificationController::class, 'index']);
Route::post('/notifications', [NotificationController::class, 'store']);
Route::post('/invite', [InviteController::class, 'send']);
