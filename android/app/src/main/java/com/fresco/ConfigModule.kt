package com.fresco

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ConfigModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "Config"
    }

    override fun getConstants(): Map<String, Any> {
        val constants: MutableMap<String, Any> = HashMap()
        constants["API_BASE_URL"] = BuildConfig.API_BASE_URL
        constants["NAVER_CLIENT_ID"] = BuildConfig.NAVER_CLIENT_ID
        constants["NAVER_CLIENT_SECRET"] = BuildConfig.NAVER_CLIENT_SECRET
        return constants
    }
}