package com.example.velox

// CheckoutActivity.kt
import android.content.Context
import android.graphics.Bitmap
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.journeyapps.barcodescanner.BarcodeEncoder
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class CheckoutActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_checkout)

        val txtCountdown = findViewById<TextView>(R.id.txtCountdown) // "2" rojo gigante
        val imgBarcode = findViewById<ImageView>(R.id.imgBarcode)

        val prefs = getSharedPreferences("VeloxPrefs", Context.MODE_PRIVATE)
        val speedMs = prefs.getLong("speed_ms", 500L)

        lifecycleScope.launch {
            txtCountdown.visibility = View.VISIBLE
            imgBarcode.visibility = View.GONE

            for (i in 3 downTo 1) {
                txtCountdown.text = i.toString()
                delay(1000)
            }

            txtCountdown.visibility = View.GONE
            imgBarcode.visibility = View.VISIBLE

            for (item in CartManager.items) {
                val bitmap = generarCodigoBarra(item.barcode)
                repeat(item.quantity) {
                    imgBarcode.setImageBitmap(bitmap)
                    delay(speedMs) // Retraso configurable

                    imgBarcode.setImageDrawable(null)
                    delay(50)
                }
            }
            finish()
        }
    }

    private fun generarCodigoBarra(contenido: String): Bitmap {
        val multiFormatWriter = MultiFormatWriter()
        val bitMatrix = multiFormatWriter.encode(contenido, BarcodeFormat.CODE_128, 600, 300)
        val barcodeEncoder = BarcodeEncoder()
        return barcodeEncoder.createBitmap(bitMatrix)
    }
}