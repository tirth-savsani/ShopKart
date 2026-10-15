import axiosInstance from "../axiosCalls/axios";

/**
 * Fetch products with optional search query, category filter, and sorting
 * @param {Object} params - { search, category, sort }
 * @returns {Promise<Object>} response data { success, count, products }
 */
export const getProducts = async ({ search = "", category = "", sort = "" } = {}) => {
  const params = {};
  if (search && search.trim() !== "") {
    params.search = search.trim();
  }
  if (category && category.trim() !== "" && category !== "All Categories" && category !== "All") {
    params.category = category.trim();
  }
  if (sort && sort.trim() !== "") {
    params.sort = sort.trim();
  }

  const response = await axiosInstance.get("/products", { params });
  return response.data;
};

/**
 * Fetch a single product by MongoDB ID
 * @param {string} id - Product ObjectId
 * @returns {Promise<Object>} response data { success, product }
 */
export const getProductById = async (id) => {
  const response = await axiosInstance.get(`/products/${id}`);
  return response.data;
};

/**
 * Create a new product
 * @param {Object} productData
 * @returns {Promise<Object>} created product
 */
export const createProduct = async (productData) => {
  const response = await axiosInstance.post("/products", productData);
  return response.data;
};

/**
 * Fetch current user's populated wishlist
 * @returns {Promise<Object>} response data { success, count, wishlist }
 */
export const getWishlist = async () => {
  const response = await axiosInstance.get("/wishlist");
  return response.data;
};

/**
 * Add a product to the authenticated user's wishlist
 * @param {string} productId
 * @returns {Promise<Object>} response data { success, message }
 */
export const addToWishlist = async (productId) => {
  const response = await axiosInstance.post(`/wishlist/${productId}`);
  return response.data;
};

/**
 * Remove a product from the authenticated user's wishlist
 * @param {string} productId
 * @returns {Promise<Object>} response data { success, message }
 */
export const removeFromWishlist = async (productId) => {
  const response = await axiosInstance.delete(`/wishlist/${productId}`);
  return response.data;
};

/**
 * Toggle a product in the user's wishlist (Bonus Challenge)
 * @param {string} productId
 * @returns {Promise<Object>} response data { success, saved, message }
 */
export const toggleWishlist = async (productId) => {
  const response = await axiosInstance.patch(`/wishlist/${productId}/toggle`);
  return response.data;
};

/**
 * Fetch current user's populated cart
 * @returns {Promise<Object>} response data { success, cart }
 */
export const getCart = async () => {
  const response = await axiosInstance.get("/cart");
  return response.data;
};

/**
 * Add a product to the user's cart (or increment quantity)
 * @param {string} productId
 * @returns {Promise<Object>} response data { success, message, cart }
 */
export const addToCart = async (productId) => {
  const response = await axiosInstance.post(`/cart/${productId}`);
  return response.data;
};

/**
 * Update quantity for a product in the cart
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Object>} response data { success, message, cart }
 */
export const updateCartQuantity = async (productId, quantity) => {
  const response = await axiosInstance.patch(`/cart/${productId}`, { quantity });
  return response.data;
};

/**
 * Remove a product from the user's cart
 * @param {string} productId
 * @returns {Promise<Object>} response data { success, message, cart }
 */
export const removeFromCart = async (productId) => {
  const response = await axiosInstance.delete(`/cart/${productId}`);
  return response.data;
};

/**
 * Create a ShopKart pending order and Razorpay order
 * @param {Object} shippingAddress
 * @returns {Promise<Object>} response data { success, shopKartOrderId, razorpayOrderId, amount, currency, key }
 */
export const createPaymentOrder = async (shippingAddress) => {
  const response = await axiosInstance.post("/orders/create-payment-order", {
    shippingAddress,
  });
  return response.data;
};

/**
 * Verify Razorpay payment signature and confirm order
 * @param {Object} paymentData - { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
 * @returns {Promise<Object>} response data { success, message, order }
 */
export const verifyPayment = async (paymentData) => {
  const response = await axiosInstance.post("/orders/verify-payment", paymentData);
  return response.data;
};

/**
 * Fetch current user's order history
 * @returns {Promise<Object>} response data { success, count, orders }
 */
export const getMyOrders = async () => {
  const response = await axiosInstance.get("/orders");
  return response.data;
};

/**
 * Fetch a single order by ID
 * @param {string} id
 * @returns {Promise<Object>} response data { success, order }
 */
export const getOrderById = async (id) => {
  const response = await axiosInstance.get(`/orders/${id}`);
  return response.data;
};

/**
 * Update order status (Bonus developer simulator)
 * @param {string} id
 * @param {string} status
 * @returns {Promise<Object>} response data { success, order }
 */
export const updateOrderStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/orders/${id}/status`, { status });
  return response.data;
};

