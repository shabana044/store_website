import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function Account() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccount();
  }, []);

  async function loadAccount() {
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

    if (!error) {
      setOrders(data);
    }

    setLoading(false);
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
                  <p>Status: <strong>{order.status}</strong></p>
                  <p>Phone: {order.phone}</p>
                  <p>Address: {order.address}</p>
                </div>
              </div>

              <div className="order-items-box">
                <h4>Items</h4>

                {order.order_items.map((item) => (
                  <div className="order-item-row" key={item.id}>
                    <span>{item.product_name}</span>
                    <span>{item.quantity} × ₹{item.price}</span>
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