import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function AdminDashboard() {
  const navigate = useNavigate();

  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
  });

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate('/admin/login');
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || profile.role !== 'admin') {
      await supabase.auth.signOut();
      navigate('/admin/login');
      return;
    }

    setAdminEmail(user.email);
    setLoading(false);
    fetchDashboardStats();
  }

  async function fetchDashboardStats() {
    setStatsLoading(true);
    setErrorMessage('');

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, stock');

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total_price, status');

    if (productsError || ordersError) {
      setErrorMessage(productsError?.message || ordersError?.message);
      setStatsLoading(false);
      return;
    }

    const totalProducts = products.length;
    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
      (order) => order.status === 'Pending'
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.status === 'Delivered'
    ).length;

    const cancelledOrders = orders.filter(
      (order) => order.status === 'Cancelled'
    ).length;

    const totalRevenue = orders
      .filter((order) => order.status !== 'Cancelled')
      .reduce((total, order) => total + Number(order.total_price || 0), 0);

    const lowStockProducts = products.filter(
      (product) => Number(product.stock) > 0 && Number(product.stock) <= 5
    ).length;

    const outOfStockProducts = products.filter(
      (product) => Number(product.stock) <= 0
    ).length;

    setStats({
      totalProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
      lowStockProducts,
      outOfStockProducts,
    });

    setStatsLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate('/admin/login');
  }

  if (loading) {
    return <p>Checking admin access...</p>;
  }

  return (
    <section>
      <div className="admin-hero">
        <div>
          <p className="tagline">Admin Panel</p>
          <h2>Store Dashboard</h2>
          <p>Track products, orders, revenue, and stock status.</p>
          <p className="admin-email">Logged in as {adminEmail}</p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      {statsLoading ? (
        <p>Loading dashboard stats...</p>
      ) : (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span>👗</span>
            <p>Total Products</p>
            <h3>{stats.totalProducts}</h3>
          </div>

          <div className="admin-stat-card">
            <span>🛍️</span>
            <p>Total Orders</p>
            <h3>{stats.totalOrders}</h3>
          </div>

          <div className="admin-stat-card">
            <span>⏳</span>
            <p>Pending Orders</p>
            <h3>{stats.pendingOrders}</h3>
          </div>

          <div className="admin-stat-card">
            <span>✅</span>
            <p>Delivered Orders</p>
            <h3>{stats.deliveredOrders}</h3>
          </div>

          <div className="admin-stat-card">
            <span>❌</span>
            <p>Cancelled Orders</p>
            <h3>{stats.cancelledOrders}</h3>
          </div>

          <div className="admin-stat-card">
            <span>💰</span>
            <p>Total Revenue</p>
            <h3>₹{stats.totalRevenue}</h3>
          </div>

          <div className="admin-stat-card warning-stat">
            <span>⚠️</span>
            <p>Low Stock</p>
            <h3>{stats.lowStockProducts}</h3>
          </div>

          <div className="admin-stat-card danger-stat">
            <span>🚫</span>
            <p>Out of Stock</p>
            <h3>{stats.outOfStockProducts}</h3>
          </div>
        </div>
      )}

      <div className="admin-grid dashboard-actions-grid">
        <div className="admin-card dashboard-card">
          <div className="admin-card-icon">👗</div>
          <h3>Products</h3>
          <p>
            Add new dresses, update product details, upload images, and delete
            old products.
          </p>

          <Link to="/admin/products" className="small-btn admin-card-btn">
            Manage Products
          </Link>
        </div>

        <div className="admin-card dashboard-card">
          <div className="admin-card-icon">🛍️</div>
          <h3>Orders</h3>
          <p>
            View customer orders, check delivery details, filter orders, and
            update order status.
          </p>

          <Link to="/admin/orders" className="small-btn admin-card-btn">
            View Orders
          </Link>
        </div>

        <div className="admin-card dashboard-card">
          <div className="admin-card-icon">⚠️</div>
          <h3>Stock Check</h3>
          <p>
            Check low-stock and out-of-stock products so you can restock dresses
            on time.
          </p>

          <Link to="/admin/products" className="small-btn admin-card-btn">
            Check Stock
          </Link>
        </div>

        <div className="admin-card dashboard-card">
          <div className="admin-card-icon">✨</div>
          <h3>Store Status</h3>
          <p>
            Your boutique is connected with Supabase database, auth, storage,
            and Vercel hosting.
          </p>

          <Link to="/products" className="small-btn admin-card-btn">
            View Store
          </Link>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;