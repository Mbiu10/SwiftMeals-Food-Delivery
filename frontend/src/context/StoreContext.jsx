import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cartItems");
    return savedCart ? JSON.parse(savedCart) : {};
  });

  const url = "http://localhost:4000";
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [food_list, setFoodList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Persist cartItems to localStorage
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Persist token and role to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      setRole("");
      setCartItems({});
    }
  }, [token, role]);

  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`, {
        headers: { token: token || "" },
      });
      if (response.data.success) {
        setFoodList(response.data.data || []);
      } else {
        console.error("Failed to fetch food list:", response.data.message);
        setFoodList([]);
      }
    } catch (error) {
      console.error("Error fetching food list:", error.response?.data || error.message);
      setFoodList([]);
    }
  };

  const fetchCartItems = async () => {
    if (!token) {
      setCartItems({});
      return;
    }
    try {
      const response = await axios.get(`${url}/api/cart/get`, { headers: { token } });
      if (response.data.success) {
        const fetchedCart = response.data.cartItems || {};
        setCartItems(fetchedCart);
        localStorage.setItem("cartItems", JSON.stringify(fetchedCart));
      } else {
        console.error("Failed to fetch cart items:", response.data.message);
        setCartItems({});
      }
    } catch (error) {
      console.error("Error fetching cart items:", error.response?.data || error.message);
      setCartItems({});
    }
  };

  const addToCart = async (itemId) => {
    setCartItems((prev) => {
      const updatedCart = { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
      return updatedCart;
    });

    if (token) {
      try {
        const response = await axios.post(
          `${url}/api/cart/add`,
          { itemId },
          { headers: { token } }
        );
        if (!response.data.success) {
          console.error("Failed to add to cart on backend:", response.data.message);
          // Revert the frontend change if backend fails
          setCartItems((prev) => {
            const updatedCart = { ...prev };
            if (updatedCart[itemId] > 1) {
              updatedCart[itemId] -= 1;
            } else {
              delete updatedCart[itemId];
            }
            return updatedCart;
          });
        }
      } catch (error) {
        console.error("Error adding to cart:", error.response?.data || error.message);
        // Revert the frontend change on error
        setCartItems((prev) => {
          const updatedCart = { ...prev };
          if (updatedCart[itemId] > 1) {
            updatedCart[itemId] -= 1;
          } else {
            delete updatedCart[itemId];
          }
          return updatedCart;
        });
      }
    }
  };

  const removeFromCart = async (itemId) => {
    const previousQuantity = cartItems[itemId] || 0;
    setCartItems((prev) => {
      const updatedCart = { ...prev };
      if (updatedCart[itemId] > 1) {
        updatedCart[itemId] -= 1;
      } else {
        delete updatedCart[itemId];
      }
      return updatedCart;
    });

    if (token) {
      try {
        const response = await axios.post(
          `${url}/api/cart/remove`,
          { itemId },
          { headers: { token } }
        );
        if (!response.data.success) {
          console.error("Failed to remove from cart on backend:", response.data.message);
          // Revert the frontend change if backend fails
          setCartItems((prev) => ({
            ...prev,
            [itemId]: previousQuantity,
          }));
        }
      } catch (error) {
        console.error("Error removing from cart:", error.response?.data || error.message);
        // Revert the frontend change on error
        setCartItems((prev) => ({
          ...prev,
          [itemId]: previousQuantity,
        }));
      }
    }
  };

  const getTotalCartAmount = () => {
    if (!food_list || food_list.length === 0) return 0;
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        const itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const filteredFoodList = food_list.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await fetchFoodList();
      if (token) {
        await fetchCartItems();
      }
      setLoading(false);
    }
    loadData();
  }, [token]);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    role,
    setRole,
    setSearchQuery,
    filteredFoodList,
    loading,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;