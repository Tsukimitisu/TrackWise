<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SystemSettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::all()->pluck('value', 'key')->toArray();
        return response()->json($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->all();

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => is_array($value) ? json_encode($value) : (string) $value]);
        }

        $settings = Setting::all()->pluck('value', 'key')->toArray();
        return response()->json($settings);
    }
}
