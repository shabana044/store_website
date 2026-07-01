import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cartItems');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  function addToCart(product) {
    const stock = Number(product.stock) || 0;

    if (stock <= 0) {
      return {
        success: false,
        message: 'This product is out of stock.',
      };
    }

    let result = {
      success: true,
      message: 'Added to cart ✅',
    };

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        if (existingItem.quantity >= stock) {
          result = {
            success: false,
            message: `Only ${stock} item(s) available in stock.`,
          };

          return prevItems;
        }

        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, stock }
            : item
        );
      }

      return [...prevItems, { ...product, stock, quantity: 1 }];
    });

    return result;
  }

  function removeFromCart(productId) {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
  }

  function increaseQuantity(productId) {
    let result = {
      success: true,
      message: '',
    };

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== productId) return item;

        const stock = Number(item.stock) || 0;

        if (item.quantity >= stock) {
          result = {
            success: false,
            message: `Only ${stock} item(s) available in stock.`,
          };

          return item;
        }

        return { ...item, quantity: item.quantity + 1 };
      })
    );

    return result;
  }

  function decreaseQuantity(productId) {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const totalPrice = cartItems.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}