package com.example.velox

// ProductAdapter.kt
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class ProductAdapter(
    private val items: MutableList<Product>,
    private val onQuantityChanged: () -> Unit
) : RecyclerView.Adapter<ProductAdapter.ViewHolder>() {

    class ViewHolder(view: View) : RecyclerView.ViewHolder(view) {
        val txtBarcode: TextView = view.findViewById(R.id.txtBarcode)
        val txtSubCode: TextView = view.findViewById(R.id.txtSubCode)
        val txtQuantity: TextView = view.findViewById(R.id.txtQuantity)
        val btnMinus: ImageButton = view.findViewById(R.id.btnMinus)
        val btnPlus: ImageButton = view.findViewById(R.id.btnPlus)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_product, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val product = items[position]
        holder.txtBarcode.text = product.name
        holder.txtSubCode.text = "${holder.itemView.context.getString(R.string.prefix_code)}${product.barcode}"
        holder.txtQuantity.text = product.quantity.toString()

        holder.btnPlus.setOnClickListener {
            product.quantity++
            notifyItemChanged(position)
            onQuantityChanged()
        }

        holder.btnMinus.setOnClickListener {
            if (product.quantity > 1) {
                product.quantity--
                notifyItemChanged(position)
            } else {
                items.removeAt(position)
                notifyItemRemoved(position)
                notifyItemRangeChanged(position, items.size)
            }
            onQuantityChanged()
        }
    }

    override fun getItemCount() = items.size
}