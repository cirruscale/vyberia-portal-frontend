import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/lib/context/CartContext'
import { Button } from '@/components/ui/Button'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
function imgUrl(url?: string) {
  if (!url) return 'https://placehold.co/80x80/f5f5f4/a8a29e?text=?'
  return url.startsWith('http') ? url : `${BASE_URL}${url}`
}

export default function CartPage() {
  const { items, cartTotal, updateItem, removeItem } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) return (
    <div className="max-w-3xl mx-auto py-20 text-center animate-fade-in">
      <h2 className="text-lg font-bold mb-2">Your cart is empty</h2>
      <p className="text-sm text-muted mb-4">Add some products to get started.</p>
      <Link to="/products" className="text-sm font-medium text-brand hover:text-brand-hover">Browse products &rarr;</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto py-6 animate-fade-in">
      <h1 className="text-xl font-bold mb-6">Cart ({items.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item.product_id} className="flex gap-4 bg-white rounded-xl shadow-sm p-4">
              <Link to={`/products/${item.product.slug}`} className="relative w-20 h-20 flex-shrink-0 bg-stone-100 rounded-lg overflow-hidden">
                <img src={imgUrl(item.product.image_url)} alt={item.product.title} className="absolute inset-0 w-full h-full object-cover" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product.slug}`} className="text-sm font-medium truncate block hover:text-brand transition-colors">{item.product.title}</Link>
                <p className="text-xs text-muted">৳{item.product.price.toLocaleString()} each</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-stone-200 rounded-lg text-sm">
                    <button className="px-2.5 py-1 text-stone-500 hover:text-stone-900 cursor-pointer" onClick={() => updateItem(item.product_id, item.quantity - 1)}>-</button>
                    <span className="w-8 text-center text-xs font-medium border-x border-stone-200">{item.quantity}</span>
                    <button className="px-2.5 py-1 text-stone-500 hover:text-stone-900 cursor-pointer" onClick={() => updateItem(item.product_id, item.quantity + 1)}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.product_id)} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">Remove</button>
                </div>
              </div>
              <div className="text-sm font-semibold flex-shrink-0">৳{(item.product.price * item.quantity).toLocaleString()}</div>
            </div>
          ))}
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm p-5 sticky top-20">
            <h2 className="font-semibold mb-4">Summary</h2>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-muted"><span>Subtotal</span><span>৳{cartTotal.toLocaleString()}</span></div>
              <div className="flex justify-between text-muted"><span>Delivery</span><span className="text-xs">At checkout</span></div>
            </div>
            <div className="border-t border-stone-100 pt-3 flex justify-between font-bold text-base mb-5">
              <span>Total</span><span>৳{cartTotal.toLocaleString()}</span>
            </div>
            <Button size="lg" className="w-full" onClick={() => navigate('/checkout')}>Checkout</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
