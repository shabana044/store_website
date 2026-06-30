import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setOrders(data);
    }

    setLoading(false);
  }

  async function updateStatus(orderId, newStatus) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      alert(error.message);
      return;
    }

    fetchOrders();
  }

  const filteredOrders = orders.filter((order) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      order.id?.toLowerCase().includes(search) ||
      order.customer_name?.toLowerCase().includes(search) ||
      order.phone?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === 'All' || order.status === statusFilter;

    const matchesPayment =
      paymentFilter === 'All' || order.payment_method === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (errorMessage) {
    return <p className="error-text">Error: {errorMessage}</p>;
  }

  return (
    <section>
      <div className="products-hero">
        <p className="tagline">Admin Panel</p>
        <h2>Customer Orders</h2>
        <p>Search orders and filter by status or payment method.</p>
      </div>

      <div className="admin-order-filters">
        <input
          type="text"
          placeholder="Search by customer name, phone, or order ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="All">All Payments</option>
          <option value="COD">COD</option>
          <option value="UPI">UPI</option>
        </select>
      </div>

      <p className="admin-order-count">
        Showing {filteredOrders.length} of {orders.length} orders
      </p>

      {filteredOrders.length === 0 ? (
        <div className="empty-products">
          <h3>No matching orders</h3>
          <p>Try changing the search or filter.</p>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-top">
                <div>
                  <h3>{order.customer_name}</h3>
                  <p>
                    Order ID: <strong>{order.id}</strong>
                  </p>
                  <p>Phone: {order.phone}</p>
                  <p>Total: ₹{order.total_price}</p>
                  <p>
                    Status: <strong>{order.status}</strong>
                  </p>
                </div>

                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="admin-order-section">
                <h4>Delivery Address</h4>

                <div className="admin-address-grid">
                  <p>
                    <strong>House/Flat:</strong>{' '}
                    {order.address_line1 || 'Not given'}
                  </p>
                  <p>
                    <strong>Area:</strong>{' '}
                    {order.address_line2 || 'Not given'}
                  </p>
                  <p>
                    <strong>City:</strong> {order.city || 'Not given'}
                  </p>
                  <p>
                    <strong>District:</strong> {order.district || 'Not given'}
                  </p>
                  <p>
                    <strong>State:</strong> {order.state || 'Not given'}
                  </p>
                  <p>
                    <strong>Pincode:</strong> {order.pincode || 'Not given'}
                  </p>
                  <p>
                    <strong>Landmark:</strong> {order.landmark || 'Not given'}
                  </p>
                </div>

                {order.maps_url && (
                  <a
                    href={order.maps_url}
                    target="_blank"
                    rel="noreferrer"
                    className="maps-link admin-map-link"
                  >
                    Open Customer Location in Google Maps
                  </a>
                )}
              </div>

              <div className="admin-order-section">
                <h4>Payment Details</h4>

                <p>
                  <strong>Method:</strong> {order.payment_method || 'COD'}
                </p>

                {order.payment_method === 'UPI' && (
                  <p>
                    <strong>UPI Transaction ID:</strong>{' '}
                    {order.upi_transaction_id || 'Not provided'}
                  </p>
                )}
              </div>

              <div className="order-items-box">
                <h4>Ordered Items</h4>

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
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminOrders;