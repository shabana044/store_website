import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../context/CartContext';

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [addedMessage, setAddedMessage] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  async function fetchProduct() {
    setLoading(true);

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      setErrorMessage(error.message);
    } else {
      setProduct(data);
    }

    setLoading(false);
  }

  function handleAddToCart() {
    addToCart(product);
    setAddedMessage('Added to cart ✅');

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

          <p className="details-description">
            {product.description || 'A beautiful dress from our boutique collection.'}
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
              <strong>{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</strong>
            </div>
          </div>

          <button
            className="primary-btn details-cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>

          {addedMessage && <p className="success-text">{addedMessage}</p>}
        </div>
      </div>
    </section>
  );
}

export default ProductDetails;