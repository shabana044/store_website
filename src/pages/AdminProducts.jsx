import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function AdminProducts() {
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    size: '',
    color: '',
    description: '',
    stock: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setProducts(data);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  function handleImageChange(e) {
    setImageFile(e.target.files[0]);
  }

  async function uploadImage() {
    if (!imageFile) {
      return null;
    }

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, imageFile);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const imageUrl = await uploadImage();

      const productData = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        size: formData.size,
        color: formData.color,
        description: formData.description,
        stock: Number(formData.stock),
      };

      if (imageUrl) {
        productData.image_url = imageUrl;
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) {
          throw error;
        }

        setSuccessMessage('Product updated successfully ✅');
      } else {
        const { error } = await supabase.from('products').insert([
          {
            ...productData,
            image_url: imageUrl,
          },
        ]);

        if (error) {
          throw error;
        }

        setSuccessMessage('Product added successfully ✅');
      }

      resetForm(e);
      fetchProducts();
    } catch (error) {
      setErrorMessage(error.message);
    }

    setLoading(false);
  }

  function handleEdit(product) {
    setEditingProduct(product);

    setFormData({
      name: product.name || '',
      price: product.price || '',
      category: product.category || '',
      size: product.size || '',
      color: product.color || '',
      description: product.description || '',
      stock: product.stock || '',
    });

    setImageFile(null);
    setSuccessMessage('');
    setErrorMessage('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function resetForm(e) {
    setFormData({
      name: '',
      price: '',
      category: '',
      size: '',
      color: '',
      description: '',
      stock: '',
    });

    setImageFile(null);
    setEditingProduct(null);

    if (e?.target) {
      e.target.reset();
    }
  }

  async function handleDelete(productId) {
    const confirmDelete = window.confirm('Delete this product?');

    if (!confirmDelete) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      alert(error.message);
      return;
    }

    fetchProducts();
  }

  return (
    <section>
      <p className="tagline">Admin Panel</p>
      <h2>Manage Products</h2>

      <div className="admin-products-layout">
        <form className="admin-product-form" onSubmit={handleSubmit}>
          <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>

          <input
            type="text"
            name="name"
            placeholder="Product name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="size"
            placeholder="Size example: S, M, L"
            value={formData.size}
            onChange={handleChange}
          />

          <input
            type="text"
            name="color"
            placeholder="Color"
            value={formData.color}
            onChange={handleChange}
          />

          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={formData.stock}
            onChange={handleChange}
            required
          />

          <input type="file" accept="image/*" onChange={handleImageChange} />

          <textarea
            name="description"
            placeholder="Description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
          />

          {errorMessage && <p className="error-text">{errorMessage}</p>}
          {successMessage && <p className="success-text">{successMessage}</p>}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading
              ? 'Saving...'
              : editingProduct
              ? 'Update Product'
              : 'Add Product'}
          </button>

          {editingProduct && (
            <button
              type="button"
              className="cancel-btn"
              onClick={() => resetForm()}
            >
              Cancel Edit
            </button>
          )}
        </form>

        <div className="admin-product-list">
          <h3>All Products</h3>

          {products.map((product) => (
            <div className="admin-product-item" key={product.id}>
              <div className="admin-product-left">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="admin-product-thumb"
                  />
                ) : (
                  <div className="admin-product-thumb placeholder-thumb">
                    {product.name.charAt(0)}
                  </div>
                )}

                <div>
                  <h4>{product.name}</h4>
                  <p>₹{product.price} • {product.category}</p>
                  <p>Stock: {product.stock}</p>
                </div>
              </div>

              <div className="admin-actions">
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(product)}
                >
                  Edit
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(product.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AdminProducts;