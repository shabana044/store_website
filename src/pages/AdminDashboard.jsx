import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function AdminDashboard() {
  const navigate = useNavigate();

  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);

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
          <p>Manage your boutique products, orders, and store activity.</p>
          <p className="admin-email">Logged in as {adminEmail}</p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="admin-grid">
        <div className="admin-card dashboard-card">
          <div className="admin-card-icon">👗</div>
          <h3>Products</h3>
          <p>Add new dresses, update product details, upload images, and delete old products.</p>

          <Link to="/admin/products" className="small-btn admin-card-btn">
            Manage Products
          </Link>
        </div>

        <div className="admin-card dashboard-card">
          <div className="admin-card-icon">🛍️</div>
          <h3>Orders</h3>
          <p>View customer orders, check ordered items, and update delivery status.</p>

          <Link to="/admin/orders" className="small-btn admin-card-btn">
            View Orders
          </Link>
        </div>

        <div className="admin-card dashboard-card">
          <div className="admin-card-icon">✨</div>
          <h3>Store Status</h3>
          <p>Your boutique is connected with Supabase database, auth, and storage.</p>

          <Link to="/products" className="small-btn admin-card-btn">
            View Store
          </Link>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;