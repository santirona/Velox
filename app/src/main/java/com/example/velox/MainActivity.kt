package com.example.velox

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.Gravity
import android.widget.Button
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.SeekBar
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.journeyapps.barcodescanner.ScanContract
import com.journeyapps.barcodescanner.ScanOptions
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private val prefs by lazy { getSharedPreferences("VeloxPrefs", Context.MODE_PRIVATE) }
    private lateinit var adapter: ProductAdapter
    private val barcodeLauncher = registerForActivityResult(ScanContract()) { result ->
        if (result.contents != null) {
            CartManager.addProduct(result.contents) {
                adapter.notifyDataSetChanged()
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        val lang = prefs.getString("language", "es") ?: "es"
        aplicarIdiomaLocal(lang)

        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        verificarPrimerUso()

        val recyclerView = findViewById<RecyclerView>(R.id.recyclerView)
        adapter = ProductAdapter(CartManager.items) {}
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter

        findViewById<Button>(R.id.btnScan).setOnClickListener {
            iniciarEscaneo()
        }

        findViewById<Button>(R.id.btnCheckout).setOnClickListener {
            if (CartManager.items.isNotEmpty()) {
                startActivity(Intent(this, CheckoutActivity::class.java))
            } else {
                android.widget.Toast.makeText(this, getString(R.string.toast_empty_cart), android.widget.Toast.LENGTH_SHORT).show()
            }
        }

        findViewById<ImageButton>(R.id.btnClearAll).setOnClickListener {
            CartManager.clearAll()
            adapter.notifyDataSetChanged()
        }

        findViewById<ImageButton>(R.id.btnMenu).setOnClickListener {
            mostrarMenuOpciones()
        }
    }

    private fun aplicarIdiomaLocal(lang: String) {
        val locale = Locale(lang)
        Locale.setDefault(locale)
        val config = resources.configuration
        config.setLocale(locale)
        resources.updateConfiguration(config, resources.displayMetrics)
    }

    private fun iniciarEscaneo() {
        val options = ScanOptions()
        options.setPrompt(getString(R.string.scan_prompt))
        options.setBeepEnabled(false)
        options.setOrientationLocked(true)
        options.setCaptureActivity(CustomScannerActivity::class.java)
        barcodeLauncher.launch(options)
    }

    private fun verificarPrimerUso() {
        if (prefs.getBoolean("isFirstRun", true)) {
            mostrarTutorial()
            prefs.edit().putBoolean("isFirstRun", false).apply()
        }
    }

    private fun mostrarTutorial() {
        AlertDialog.Builder(this)
            .setTitle(getString(R.string.tutorial_title))
            .setMessage(getString(R.string.tutorial_msg))
            .setPositiveButton(getString(R.string.btn_understood), null)
            .show()
    }

    private fun mostrarMenuOpciones() {
        val opciones = arrayOf(
            getString(R.string.menu_how_to_use),
            getString(R.string.menu_advanced),
            getString(R.string.menu_language)
        )
        AlertDialog.Builder(this)
            .setTitle(getString(R.string.menu_title))
            .setItems(opciones) { _, which ->
                when (which) {
                    0 -> mostrarTutorial()
                    1 -> mostrarOpcionesAvanzadas()
                    2 -> alternarIdioma()
                }
            }
            .setNegativeButton(getString(R.string.btn_close), null)
            .show()
    }

    private fun mostrarOpcionesAvanzadas() {
        val linearLayout = LinearLayout(this)
        linearLayout.orientation = LinearLayout.VERTICAL
        linearLayout.setPadding(64, 64, 64, 64)

        val speedActual = prefs.getLong("speed_ms", 500L).toInt()
        val seekBar = SeekBar(this)
        seekBar.max = 900
        seekBar.progress = speedActual - 100

        val tvValue = TextView(this)
        tvValue.text = "$speedActual ms"
        tvValue.gravity = Gravity.CENTER
        tvValue.textSize = 18f
        tvValue.setPadding(0, 0, 0, 32)

        seekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(bar: SeekBar?, progress: Int, fromUser: Boolean) {
                tvValue.text = "${progress + 100} ms"
            }
            override fun onStartTrackingTouch(bar: SeekBar?) {}
            override fun onStopTrackingTouch(bar: SeekBar?) {}
        })

        linearLayout.addView(tvValue)
        linearLayout.addView(seekBar)

        AlertDialog.Builder(this)
            .setTitle(getString(R.string.speed_title))
            .setView(linearLayout)
            .setPositiveButton(getString(R.string.btn_save)) { _, _ ->
                prefs.edit().putLong("speed_ms", (seekBar.progress + 100).toLong()).apply()
            }
            .setNegativeButton(getString(R.string.btn_close), null)
            .show()
    }

    private fun alternarIdioma() {
        val currentLang = prefs.getString("language", "es") ?: "es"
        val newLang = if (currentLang == "es") "en" else "es"
        prefs.edit().putString("language", newLang).apply()
        recreate()
    }
}