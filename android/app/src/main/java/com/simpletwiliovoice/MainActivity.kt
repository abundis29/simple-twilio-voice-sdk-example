package com.simpletwiliovoice

import android.content.pm.PackageManager
import android.os.Bundle
import android.Manifest
import androidx.core.app.ActivityCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "simpleTwilioVoice"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      object : DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled) {
        override fun onCreate(savedInstanceState: Bundle?) {
          super.onCreate(savedInstanceState)
          askForAudioPermission()
        }
      }

  private fun askForAudioPermission() {
    val permission = Manifest.permission.RECORD_AUDIO
    if (ActivityCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
        ActivityCompat.requestPermissions(this, arrayOf(permission), 42)
        // You can throw in a nice message like "Can I record your soul's melody?"
    }
  }
}
