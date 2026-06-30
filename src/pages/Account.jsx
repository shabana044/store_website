import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function Account() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate('/login');
      return;
    }

    setUser(user);

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setOrders(data);
    }

    setLoading(false);
  }

  async function handleCancelOrder(orderId) {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this order?'
    );

    if (!confirmCancel) return;

    setCancelLoadingId(orderId);
    setErrorMessage('');
    setSuccessMessage('');

    const { error } = await supabase.rpc('cancel_order_with_stock', {
      p_order_id: orderId,
    });

    if (error) {
      setErrorMessage(error.message);
      setCancelLoadingId('');
      return;
    }

    setSuccessMessage('Order cancelled successfully ✅');
    setCancelLoadingId('');

    loadAccount();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  if (loading) {
    return <p>Loading account...</p>;
  }

  return (
    <section>
      <div className="account-header">
        <div>
          <p className="tagline">My Account</p>
          <h2>Welcome</h2>
          <p>{user?.email}</p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="account-orders">
        <h3>My Orders</h3>

        {errorMessage && <p className="error-text">{errorMessage}</p>}
        {successMessage && <p className="success-text">{successMessage}</p>}

        {orders.length === 0 ? (
          <div className="account-empty-card">
            <h3>No orders yet</h3>
            <p>Start shopping and your orders will appear here.</p>

            <Link to="/products" className="primary-btn">
              Shop Now
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-top">
                <div>
                  <h3>Order ₹{order.total_price}</h3>

                  <p>
                    Order ID: <strong>{order.id}</strong>
                  </p>

                  <p>
                    Status:{' '}
                    <strong
                      className={
                        order.status === 'Cancelled'
                          ? 'status-cancelled'
                          : 'status-normal'
                      }
                    >
                      {order.status}
                    </strong>
                  </p>

                  <p>Phone: {order.phone}</p>
                  <p>Address: {order.address}</p>
                </div>

                {order.status === 'Pending' && (
                  <button
                    className="cancel-order-btn"
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={cancelLoadingId === order.id}
                  >
                    {cancelLoadingId === order.id
                      ? 'Cancelling...'
                      : 'Cancel Order'}
                  </button>
                )}
              </div>

              <div className="order-items-box">
                <h4>Items</h4>

                {order.order_items.map((item) => (
                  <div className="order-item-row" key={item.id}>
                    <span>{item.product_name}</span>
                    <span>
                      {item.quantity} × ₹{item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Account;