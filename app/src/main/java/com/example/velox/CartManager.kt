// CartManager.kt
package com.example.velox

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

object CartManager {
    val items = mutableListOf<Product>()

    fun addProduct(barcode: String, onUpdate: () -> Unit) {
        val existing = items.find { it.barcode == barcode }
        if (existing != null) {
            existing.quantity++
            onUpdate()
        } else {
            val product = Product(barcode)
            items.add(product)
            onUpdate()

            // Buscar en red fondo
            CoroutineScope(Dispatchers.IO).launch {
                val name = fetchProductName(barcode)
                if (name != null) {
                    product.name = name
                    withContext(Dispatchers.Main) {
                        onUpdate() // Refrescar pantalla
                    }
                }
            }
        }
    }

    fun clearAll() {
        items.clear()
    }

    private fun fetchProductName(barcode: String): String? {
        val apis = listOf(
            "https://world.openfoodfacts.org/api/v0/product/$barcode.json",
            "https://world.openbeautyfacts.org/api/v0/product/$barcode.json",
            "https://world.openproductsfacts.org/api/v0/product/$barcode.json"
        )

        for (apiUrl in apis) {
            try {
                val url = URL(apiUrl)
                val conn = url.openConnection() as HttpURLConnection
                conn.connectTimeout = 3000
                conn.readTimeout = 3000

                if (conn.responseCode == 200) {
                    val json = JSONObject(conn.inputStream.bufferedReader().readText())
                    if (json.optInt("status") == 1) {
                        val productObj = json.getJSONObject("product")
                        val name = productObj.optString("product_name", "")
                        if (name.isNotEmpty()) return name
                    }
                }
            } catch (e: Exception) {
                continue // Fallo API, probar siguiente
            }
        }
        return null // No encontrado en ninguna
    }
}