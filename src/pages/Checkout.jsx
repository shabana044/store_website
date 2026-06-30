import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart } = useCart();

  const [checkingUser, setCheckingUser] = useState(true);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate('/login');
      return;
    }

    setCheckingUser(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty.');
      return;
    }

    if (!formData.customerName || !formData.phone || !formData.address) {
      setErrorMessage('Please fill all fields.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      navigate('/login');
      return;
    }

    const orderId = crypto.randomUUID();

    const { error: orderError } = await supabase.from('orders').insert([
      {
        id: orderId,
        user_id: user.id,
        customer_name: formData.customerName,
        phone: formData.phone,
        address: formData.address,
        total_price: totalPrice,
        status: 'Pending',
      },
    ]);

    if (orderError) {
      setErrorMessage(orderError.message);
      setLoading(false);
      return;
    }

    const orderItems = cartItems.map((item) => ({
      order_id: orderId,
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      setErrorMessage(itemsError.message);
      setLoading(false);
      return;
    }

    clearCart();

    setFormData({
      customerName: '',
      phone: '',
      address: '',
    });

    setSuccessMessage('Order placed successfully ✅');
    setLoading(false);
  }

  if (checkingUser) {
    return <p>Checking login...</p>;
  }

  if (cartItems.length === 0 && !successMessage) {
    return (
      <section>
        <div className="empty-cart-box">
          <h2>Checkout</h2>
          <p>Your cart is empty. Add a dress before checkout.</p>

          <Link to="/products" className="primary-btn cart-empty-btn">
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="checkout-page-header">
        <p className="tagline">Almost There</p>
        <h2>Checkout</h2>
        <p>Enter your details to place your order. Cash on delivery available.</p>
      </div>

      {successMessage && (
        <div className="success-box checkout-success">
          <div className="success-icon">✓</div>
          <h3>{successMessage}</h3>
          <p>
            Thank you for shopping with Zayna Dresses. Your order is now pending
            confirmation.
          </p>

          <Link to="/products" className="primary-btn">
            Continue Shopping
          </Link>
        </div>
      )}

      {!successMessage && (
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handleSubmit}>
            <h3>Delivery Details</h3>

            <label>
              Customer Name
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </label>

            <label>
              Delivery Address
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your full delivery address"
                rows="5"
              />
            </label>

            {errorMessage && <p className="error-text">{errorMessage}</p>}

            <button
              className="primary-btn place-order-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </form>

          <div className="checkout-summary">
            <h3>Your Order</h3>

            {cartItems.map((item) => (
              <div className="checkout-item" key={item.id}>
                <div>
                  <p>{item.name}</p>
                  <small>
                    {item.category} • {item.size}
                  </small>
                </div>

                <span>
                  {item.quantity} × ₹{item.price}
                </span>
              </div>
            ))}

            <div className="summary-row">
              <span>Payment</span>
              <strong>Cash on Delivery</strong>
            </div>

            <div className="summary-row">
              <span>Order Status</span>
              <strong>Pending</strong>
            </div>

            <p className="cart-total">Total: ₹{totalPrice}</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default Checkout;