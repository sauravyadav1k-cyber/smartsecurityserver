# Android Kotlin Update

In `MainActivity.kt`, keep your photo capture logic, but change the email upload code to call this backend.

## Use These Values

For Android emulator:

```kotlin
private val backendUrl = "http://10.0.2.2:3000/api/security-alert"
private val backendApiKey = "change-this-secret-key"
```

For real phone testing, replace `10.0.2.2` with your computer's Wi-Fi IP address:

```kotlin
private val backendUrl = "http://YOUR_COMPUTER_IP:3000/api/security-alert"
private val backendApiKey = "change-this-secret-key"
```

The `backendApiKey` must match `ALERT_API_KEY` in the backend `.env` file.

For the online hosted backend, use your HTTPS service URL:

```kotlin
private val backendUrl = "https://YOUR-HOST-NAME/api/security-alert"
private val backendApiKey = "same-value-as-hosted-ALERT_API_KEY"
```

## Replace Your Email Sending Function

```kotlin
private val backendUrl = "http://10.0.2.2:3000/api/security-alert"
private val backendApiKey = "change-this-secret-key"

private fun sendPhotosByEmail(email: String, photos: List<File>) {
    val client = OkHttpClient()

    val builder = MultipartBody.Builder()
        .setType(MultipartBody.FORM)
        .addFormDataPart("to", email)
        .addFormDataPart("subject", "Smart Security Alert")
        .addFormDataPart(
            "text",
            "Noise was detected in your room. Lux level: $currentLux. Attached photos were captured automatically."
        )

    photos.forEachIndexed { index, file ->
        builder.addFormDataPart(
            "attachments",
            "alert_photo_${index + 1}.jpg",
            file.asRequestBody("image/jpeg".toMediaTypeOrNull())
        )
    }

    val request = Request.Builder()
        .url(backendUrl)
        .addHeader("X-API-Key", backendApiKey)
        .post(builder.build())
        .build()

    client.newCall(request).enqueue(object : Callback {
        override fun onFailure(call: Call, e: IOException) {
            runOnUiThread {
                txtStatus.text = "Status: Backend/email failed"
                Toast.makeText(this@MainActivity, e.message, Toast.LENGTH_LONG).show()
            }
            alertRunning = false
        }

        override fun onResponse(call: Call, response: Response) {
            runOnUiThread {
                if (response.isSuccessful) {
                    txtStatus.text = "Status: Photos sent to email"
                    Toast.makeText(this@MainActivity, "Alert email sent", Toast.LENGTH_SHORT).show()
                } else {
                    txtStatus.text = "Status: Backend error"
                    Toast.makeText(this@MainActivity, response.message, Toast.LENGTH_LONG).show()
                }
            }
            response.close()
            alertRunning = false
        }
    })
}
```

## Required Imports

Make sure these imports are present:

```kotlin
import okhttp3.Callback
import okhttp3.Call
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.Response
import java.io.File
import java.io.IOException
```
