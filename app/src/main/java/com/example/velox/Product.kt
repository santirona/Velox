// Product.kt
package com.example.velox

data class Product(
    val barcode: String,
    var name: String = barcode,
    var quantity: Int = 1
)