import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [wishlistId, setWishlistId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [addedMessage, setAddedMessage] = useState('');

  useEffect(() => {
    fetchProduct();
    checkWishlist();
    window.scrollTo(0, 0);
  }, [id]);

  async function fetchProduct() {
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setProduct(data);
    fetchRelatedProducts(data.category, data.id);
    setLoading(false);
  }

  async function fetchRelatedProducts(category, productId) {
    if (!category) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .neq('id', productId)
      .limit(4);

    if (!error) {
      setRelatedProducts(data || []);
    }
  }

  async function checkWishlist() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', id)
      .maybeSingle();

    if (data) {
      setWishlistId(data.id);
    } else {
      setWishlistId(null);
    }
  }

  async function toggleWishlist() {
    setWishlistLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setWishlistLoading(false);
      navigate('/login');
      return;
    }

    if (wishlistId) {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistId);

      if (error) {
        alert(error.message);
      } else {
        setWishlistId(null);
      }
    } else {
      const { data, error } = await supabase
        .from('wishlists')
        .insert([
          {
            user_id: user.id,
            product_id: id,
          },
        ])
        .select('id')
        .single();

      if (error) {
        alert(error.message);
      } else {
        setWishlistId(data.id);
      }
    }

    setWishlistLoading(false);
  }

  function handleAddToCart() {
    const result = addToCart(product);

    setAddedMessage(result.message);

    setTimeout(() => {
      setAddedMessage('');
    }, 2000);
  }

  if (loading) {
    return <p>Loading product...</p>;
  }

  if (errorMessage) {
    return <p className="error-text">Error: {errorMessage}</p>;
  }

  if (!product) {
    return <p>Product not found.</p>;
  }

  return (
    <section>
      <Link to="/products" className="back-link">
        ← Back to Collection
      </Link>

      <div className="details-container">
        <div className="details-image-box">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <div className="details-placeholder">
              {product.name.charAt(0)}
            </div>
          )}
        </div>

        <div className="details-info">
          <p className="details-badge">{product.category}</p>

          <h2>{product.name}</h2>

          <p className="details-price">₹{product.price}</p>

          <span
            className={
              product.stock > 0
                ? 'details-stock-badge in-stock-badge'
                : 'details-stock-badge out-stock-badge'
            }
          >
            {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
          </span>

          <p className="details-description">
            {product.description ||
              'A beautiful dress from our boutique collection.'}
          </p>

          <div className="details-meta-grid">
            <div>
              <span>Size</span>
              <strong>{product.size || 'Free Size'}</strong>
            </div>

            <div>
              <span>Color</span>
              <strong>{product.color || 'Not specified'}</strong>
            </div>

            <div>
              <span>Stock</span>
              <strong>
                {product.stock > 0
                  ? `${product.stock} available`
                  : 'Out of stock'}
              </strong>
            </div>
          </div>

          <div className="details-actions">
            <button
              className="primary-btn details-cart-btn"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>

            <button
              className={
                wishlistId ? 'wishlist-btn active-wishlist' : 'wishlist-btn'
              }
              onClick={toggleWishlist}
              disabled={wishlistLoading}
            >
              {wishlistLoading
                ? 'Saving...'
                : wishlistId
                ? '♥ Remove Wishlist'
                : '♡ Add Wishlist'}
            </button>
          </div>

          {addedMessage && <p className="success-text">{addedMessage}</p>}
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <div className="section-header">
            <p className="tagline">You May Also Like</p>
            <h2>Related Dresses</h2>
          </div>

          <div className="product-grid">
            {relatedProducts.map((related) => (
              <div className="product-card" key={related.id}>
                <div className="product-image-wrap">
                  {related.image_url ? (
                    <img src={related.image_url} alt={related.name} />
                  ) : (
                    <div className="product-placeholder">
                      {related.name.charAt(0)}
                    </div>
                  )}

                  <span
                    className={
                      related.stock > 0
                        ? 'stock-badge in-stock-badge'
                        : 'stock-badge out-stock-badge'
                    }
                  >
                    {related.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <div className="product-info">
                  <p className="product-category">{related.category}</p>
                  <h3>{related.name}</h3>
                  <p className="product-price">₹{related.price}</p>

                  <p className="product-meta">
                    Size: {related.size} • Color: {related.color}
                  </p>

                  <Link to={`/products/${related.id}`} className="small-btn">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductDetails;