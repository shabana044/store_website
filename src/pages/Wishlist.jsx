import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';

function Wishlist() {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchWishlist();
  }, []);

  async function fetchWishlist() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate('/login');
      return;
    }

    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        id,
        product_id,
        products (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setWishlistItems(data);
    }

    setLoading(false);
  }

  async function removeFromWishlist(wishlistId) {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('id', wishlistId);

    if (error) {
      alert(error.message);
      return;
    }

    fetchWishlist();
  }

  if (loading) {
    return <p>Loading wishlist...</p>;
  }

  if (errorMessage) {
    return <p className="error-text">Error: {errorMessage}</p>;
  }

  return (
    <section>
      <div className="products-hero">
        <p className="tagline">Saved Collection</p>
        <h2>My Wishlist</h2>
        <p>Your favourite dresses are saved here.</p>
      </div>

      {wishlistItems.length === 0 ? (
  <div className="wishlist-empty-card">
    <div className="wishlist-empty-icon">♡</div>
    <h3>Your wishlist is empty</h3>
    <p>Save dresses you love and view them here later.</p>

    <Link to="/products" className="primary-btn">
      Browse Dresses
    </Link>
  </div>
) : (
        <div className="product-grid">
          {wishlistItems.map((item) => {
            const product = item.products;

            return (
              <div className="product-card" key={item.id}>
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} />
                ) : (
                  <div className="product-placeholder">
                    {product.name.charAt(0)}
                  </div>
                )}

                <div className="product-info">
                  <p className="product-category">{product.category}</p>
                  <h3>{product.name}</h3>
                  <p className="product-price">₹{product.price}</p>
                  <p className="product-meta">
                    Size: {product.size} • Color: {product.color}
                  </p>

                  <div className="wishlist-actions">
                    <Link to={`/products/${product.id}`} className="small-btn">
                      View
                    </Link>

                    <button
                      className="wishlist-remove-btn"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      Remove
                    </button>

                    <button
                      className="wishlist-cart-btn"
                      onClick={() => addToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Wishlist;