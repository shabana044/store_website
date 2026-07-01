import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function Products() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOption, setSortOption] = useState('Newest');
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
      setProducts(data || []);
    }

    setLoading(false);
  }

  const categories = useMemo(() => {
    const uniqueCategories = products
      .map((product) => product.category)
      .filter(Boolean);

    return ['All', ...new Set(uniqueCategories)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();

      result = result.filter((product) => {
        return (
          product.name?.toLowerCase().includes(search) ||
          product.category?.toLowerCase().includes(search) ||
          product.color?.toLowerCase().includes(search) ||
          product.size?.toLowerCase().includes(search)
        );
      });
    }

    if (categoryFilter !== 'All') {
      result = result.filter((product) => product.category === categoryFilter);
    }

    if (sortOption === 'Price Low to High') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sortOption === 'Price High to Low') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    if (sortOption === 'Newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [products, searchTerm, categoryFilter, sortOption]);

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (errorMessage) {
    return <p className="error-text">Error: {errorMessage}</p>;
  }

  return (
    <section>
      <div className="products-hero">
        <p className="tagline">Our Collection</p>
        <h2>All Dresses</h2>
        <p>Find your favourite boutique dresses by search, category, and price.</p>
      </div>

      <div className="product-filter-box">
        <input
          type="text"
          placeholder="Search by name, color, size, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((category) => (
            <option value={category} key={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="Newest">Newest</option>
          <option value="Price Low to High">Price Low to High</option>
          <option value="Price High to Low">Price High to Low</option>
        </select>
      </div>

      <p className="product-result-count">
        Showing {filteredProducts.length} of {products.length} dresses
      </p>

      {filteredProducts.length === 0 ? (
        <div className="empty-products">
          <h3>No dresses found</h3>
          <p>Try changing your search or filter.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map((product) => (
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
                  Stock:{' '}
                  {product.stock > 0
                    ? `${product.stock} available`
                    : 'Out of stock'}
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
      )}
    </section>
  );
}

export default Products;