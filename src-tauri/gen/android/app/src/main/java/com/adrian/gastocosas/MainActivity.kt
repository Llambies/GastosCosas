package com.adrian.gastocosas

import android.os.Bundle
import android.view.ViewGroup
import android.webkit.WebView
import androidx.core.view.WindowCompat

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Evita edge-to-edge por defecto (API 35+): la WebView llena el hueco
    // entre status bar y nav bar, sin solapar iconos del sistema.
    WindowCompat.setDecorFitsSystemWindows(window, true)
    super.onCreate(savedInstanceState)
  }

  override fun onWebViewCreate(webView: WebView) {
    webView.layoutParams = ViewGroup.LayoutParams(
      ViewGroup.LayoutParams.MATCH_PARENT,
      ViewGroup.LayoutParams.MATCH_PARENT,
    )
    webView.setBackgroundColor(0xFFF7F9FA.toInt())
  }
}
