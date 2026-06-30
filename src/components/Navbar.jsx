import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';

function Navbar() {
  const { cartItems } = useCart();
  const [user, setUser] = useState(null);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);
  }

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        Zayna<span>Dresses</span>
      </Link>

      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/wishlist">Wishlist</NavLink>

        <NavLink to="/cart" className="cart-nav-link">
          Cart
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </NavLink>

        {user ? (
          <NavLink to="/account">Account</NavLink>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </div>
    </nav>
  );
}

export default Navbar;