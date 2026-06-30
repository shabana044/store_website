import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setProducts(data);
    }

    setLoading(false);
  }

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (errorMessage) {
    return <p className="error-text">Error: {errorMessage}</p>;
  }

  return (
    <section>
      <div className="section-header">
        <p className="tagline">Our Collection</p>
        <h2>All Dresses</h2>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <div className="product-image-wrap">
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} />
              ) : (
                <div className="product-placeholder">
                  {product.name.charAt(0)}
                </div>
              )}

              <span
                className={
                  product.stock > 0
                    ? 'stock-badge in-stock-badge'
                    : 'stock-badge out-stock-badge'
                }
              >
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="product-info">
              <p className="product-category">{product.category}</p>
              <h3>{product.name}</h3>
              <p className="product-price">₹{product.price}</p>

              <p className="product-stock-text">
                Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </p>

              <p className="product-meta">
                Size: {product.size} • Color: {product.color}
              </p>

              <Link to={`/products/${product.id}`} className="small-btn">
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Products;