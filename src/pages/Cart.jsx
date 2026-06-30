import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function Cart() {
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    totalPrice,
  } = useCart();

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (cartItems.length === 0) {
    return (
      <section>
        <div className="empty-cart-box">
          <h2>Your cart is empty</h2>
          <p>Looks like you haven’t added any dresses yet.</p>

          <Link to="/products" className="primary-btn cart-empty-btn">
            Start Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="cart-page-header">
        <p className="tagline">Shopping Bag</p>
        <h2>Your Cart</h2>
        <p>Review your selected dresses before checkout.</p>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="cart-image">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} />
                ) : (
                  <div className="cart-placeholder">{item.name.charAt(0)}</div>
                )}
              </div>

              <div className="cart-details">
                <p className="product-category">{item.category}</p>
                <h3>{item.name}</h3>
                <p className="cart-item-price">₹{item.price}</p>
                <p>Size: {item.size}</p>
                <p>Color: {item.color}</p>

                <div className="quantity-controls">
                  <button onClick={() => decreaseQuantity(item.id)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => increaseQuantity(item.id)}>+</button>
                </div>

                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove item
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>

          <div className="summary-row">
            <span>Total items</span>
            <strong>{totalItems}</strong>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <strong>₹{totalPrice}</strong>
          </div>

          <div className="summary-row">
            <span>Delivery</span>
            <strong>COD</strong>
          </div>

          <p className="cart-total">Total: ₹{totalPrice}</p>

          <Link to="/checkout" className="primary-btn checkout-btn">
            Proceed to Checkout
          </Link>

          <Link to="/products" className="continue-link">
            Continue shopping
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Cart;