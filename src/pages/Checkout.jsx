import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';

const SHOP_UPI_ID = 'yourupi@bank'; // change this to your real UPI ID
const SHOP_NAME = 'Zayna Dresses';
const SHOP_WHATSAPP_NUMBER = '919207651300';
function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, clearCart } = useCart();

  const [checkingUser, setCheckingUser] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    landmark: '',
    paymentMethod: 'COD',
    upiTransactionId: '',
  });

  const [locationData, setLocationData] = useState({
    latitude: null,
    longitude: null,
    mapsUrl: '',
  });

  const [loading, setLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState('');
const [successMessage, setSuccessMessage] = useState('');
const [placedOrderId, setPlacedOrderId] = useState('');
const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

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

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      setErrorMessage('Location is not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

        setLocationData({
          latitude,
          longitude,
          mapsUrl,
        });

        setLocationLoading(false);
      },
      () => {
        setErrorMessage('Unable to get location. Please allow location permission.');
        setLocationLoading(false);
      }
    );
  }

  async function handleSubmit(e) {
  e.preventDefault();

  if (cartItems.length === 0) {
    setErrorMessage('Your cart is empty.');
    return;
  }

  if (
    !formData.customerName ||
    !formData.phone ||
    !formData.addressLine1 ||
    !formData.city ||
    !formData.district ||
    !formData.state ||
    !formData.pincode
  ) {
    setErrorMessage('Please fill all required address fields.');
    return;
  }

  if (formData.paymentMethod === 'UPI' && !formData.upiTransactionId) {
    setErrorMessage('Please enter UPI transaction ID after payment.');
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

  const fullAddress = `${formData.addressLine1}, ${formData.addressLine2}, ${formData.city}, ${formData.district}, ${formData.state} - ${formData.pincode}. Landmark: ${formData.landmark}`;

  const orderItems = cartItems.map((item) => ({
    product_id: item.id,
    product_name: item.name,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: orderError } = await supabase.rpc('place_order_with_stock', {
    p_order_id: orderId,
    p_user_id: user.id,
    p_customer_name: formData.customerName,
    p_phone: formData.phone,
    p_address: fullAddress,
    p_address_line1: formData.addressLine1,
    p_address_line2: formData.addressLine2,
    p_city: formData.city,
    p_district: formData.district,
    p_state: formData.state,
    p_pincode: formData.pincode,
    p_landmark: formData.landmark,
    p_latitude: locationData.latitude,
    p_longitude: locationData.longitude,
    p_maps_url: locationData.mapsUrl,
    p_payment_method: formData.paymentMethod,
    p_upi_transaction_id:
      formData.paymentMethod === 'UPI' ? formData.upiTransactionId : null,
    p_total_price: totalPrice,
    p_items: orderItems,
  });

  if (orderError) {
    setErrorMessage(orderError.message);
    setLoading(false);
    return;
  }

setPlacedOrderId(orderId);

setPlacedOrderDetails({
  orderId,
  customerName: formData.customerName,
  phone: formData.phone,
  totalPrice,
  paymentMethod: formData.paymentMethod,
});

clearCart();

  setFormData({
    customerName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    landmark: '',
    paymentMethod: 'COD',
    upiTransactionId: '',
  });

  setLocationData({
    latitude: null,
    longitude: null,
    mapsUrl: '',
  });

  setSuccessMessage('Order placed successfully ✅');
  setLoading(false);
}

  const upiPaymentLink = `upi://pay?pa=${SHOP_UPI_ID}&pn=${encodeURIComponent(
    SHOP_NAME
  )}&am=${totalPrice}&cu=INR`;
const whatsappMessage = placedOrderDetails
  ? `Hi ${SHOP_NAME}, I placed an order.%0A%0AOrder ID: ${placedOrderDetails.orderId}%0ACustomer Name: ${placedOrderDetails.customerName}%0APhone: ${placedOrderDetails.phone}%0ATotal: ₹${placedOrderDetails.totalPrice}%0APayment Method: ${placedOrderDetails.paymentMethod}%0A%0APlease confirm my order.`
  : '';

const whatsappLink = `https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=${whatsappMessage}`;
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
        <p>Enter delivery details and choose your payment method.</p>
      </div>

      {successMessage && (
        <div className="success-box checkout-success">
          <div className="success-icon">✓</div>
          <h3>{successMessage}</h3>
          <p>
            Thank you for shopping with Zayna Dresses. Your order is now pending
            confirmation.
          </p>
          {placedOrderId && (
  <p className="order-id-box">
    Order ID: <strong>{placedOrderId}</strong>
  </p>
)}
{placedOrderDetails && (
  <a
    href={whatsappLink}
    target="_blank"
    rel="noreferrer"
    className="whatsapp-btn"
  >
    Send confirmation on WhatsApp
  </a>
)}
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
              Customer Name *
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </label>

            <label>
              Phone Number *
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </label>

            <label>
              House / Hostel / Flat Details *
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="House no, hostel name, flat no"
              />
            </label>

            <label>
              Road / Area / Locality
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Street, area, locality"
              />
            </label>

            <div className="checkout-two-columns">
              <label>
                City *
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                />
              </label>

              <label>
                District *
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="District"
                />
              </label>
            </div>

            <div className="checkout-two-columns">
              <label>
                State *
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                />
              </label>

              <label>
                Pincode *
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                />
              </label>
            </div>

            <label>
              Landmark
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                placeholder="Nearby landmark"
              />
            </label>

            <div className="location-box">
              <button
                type="button"
                className="secondary-btn location-btn"
                onClick={getCurrentLocation}
              >
                {locationLoading ? 'Getting Location...' : 'Use My Current Location'}
              </button>

              {locationData.mapsUrl && (
                <a
                  href={locationData.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="maps-link"
                >
                  View selected location on Google Maps
                </a>
              )}
            </div>

            <h3>Payment Method</h3>

            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={handleChange}
                />
                Cash on Delivery
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  checked={formData.paymentMethod === 'UPI'}
                  onChange={handleChange}
                />
                UPI Payment
              </label>
            </div>

            {formData.paymentMethod === 'UPI' && (
              <div className="upi-box">
                <p>
                  Pay to UPI ID: <strong>{SHOP_UPI_ID}</strong>
                </p>

                <a href={upiPaymentLink} className="secondary-btn">
                  Open UPI App
                </a>

                <label>
                  UPI Transaction ID *
                  <input
                    type="text"
                    name="upiTransactionId"
                    value={formData.upiTransactionId}
                    onChange={handleChange}
                    placeholder="Enter transaction/reference ID"
                  />
                </label>
              </div>
            )}

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
              <strong>{formData.paymentMethod}</strong>
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