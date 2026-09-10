// ============================================
// SYRIA MARKET - SUPABASE INTEGRATION & SERVICES
// ============================================

const SUPABASE_URL = "https://ickurcxnyotujnutvfxi.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_jkgJH6Bc__qkrCChS9iFQw_x6D8lhel";


// ============================================
// SUPABASE CLIENT INITIALIZATION
// ============================================

let supabaseClient = null;

try {
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );
    console.log("Syria Market: Supabase connected");
  } else {
    console.error("Supabase library not loaded");
  }
} catch (error) {
  console.error("Supabase initialization error:", error);
}


// ============================================
// AUTHENTICATION SERVICES
// ============================================

/**
 * Register a new user account and initialize profile
 */
async function signUp(email, password, fullName = "") {
  if (!supabaseClient) {
    return {
      success: false,
      error: "الاتصال بقاعدة البيانات غير متاح."
    };
  }

  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      console.error("Sign up error:", error.message);
      return {
        success: false,
        error: error.message
      };
    }

    if (data?.user) {
      try {
        const { error: profileError } = await supabaseClient
          .from("profiles")
          .upsert({
            id: data.user.id,
            full_name: fullName,
            role: "customer"
          });

        if (profileError) {
          console.warn("Profile creation warning:", profileError.message);
        }
      } catch (profileError) {
        console.warn("Profile error:", profileError);
      }
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error("Sign up exception:", error);
    return {
      success: false,
      error: error.message || "حدث خطأ أثناء إنشاء الحساب."
    };
  }
}


/**
 * Sign in existing user with email and password
 */
async function signIn(email, password) {
  if (!supabaseClient) {
    return {
      success: false,
      error: "الاتصال بقاعدة البيانات غير متاح."
    };
  }

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.error("Login error:", error.message);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error("Login exception:", error);
    return {
      success: false,
      error: error.message || "حدث خطأ أثناء تسجيل الدخول."
    };
  }
}


/**
 * Sign out current authenticated user
 */
async function signOut() {
  if (!supabaseClient) {
    return {
      success: false,
      error: "الاتصال بقاعدة البيانات غير متاح."
    };
  }

  try {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true
    };
  } catch (error) {
    console.error("Logout exception:", error);
    return {
      success: false,
      error: error.message || "حدث خطأ أثناء تسجيل الخروج."
    };
  }
}


/**
 * Get current authenticated user
 */
async function getCurrentUser() {
  if (!supabaseClient) {
    return null;
  }

  try {
    const { data, error } = await supabaseClient.auth.getUser();

    if (error) {
      return null;
    }

    return data?.user || null;
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}


/**
 * Get current user profile details from database
 */
async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user || !supabaseClient) return null;

  try {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.warn("Fetch profile error:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("getUserProfile exception:", error);
    return null;
  }
}


/**
 * Update user profile details
 */
async function updateUserProfile(profileData) {
  const user = await getCurrentUser();
  if (!user || !supabaseClient) {
    return { success: false, error: "المستخدم غير مسجل الدخول" };
  }

  try {
    const payload = {
      id: user.id,
      ...profileData,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseClient
      .from("profiles")
      .upsert(payload);

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("updateUserProfile error:", error);
    return { success: false, error: error.message || "فشل تحديث البيانات الشخصية" };
  }
}


// ============================================
// CATEGORIES & PRODUCTS DATA SERVICES
// ============================================

/**
 * Fetch all categories from Supabase
 */
async function fetchCategoriesFromSupabase() {
  if (!supabaseClient) return null;

  try {
    const { data, error } = await supabaseClient
      .from("categories")
      .select("*");

    if (error) {
      console.warn("fetchCategories warning:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("fetchCategories exception:", error);
    return null;
  }
}


/**
 * Fetch all products from Supabase
 */
async function fetchProductsFromSupabase() {
  if (!supabaseClient) return null;

  try {
    const { data, error } = await supabaseClient
      .from("products")
      .select("*, sellers(*), categories(*)");

    if (error) {
      console.warn("fetchProducts warning:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("fetchProducts exception:", error);
    return null;
  }
}


/**
 * Fetch sellers list from Supabase
 */
async function fetchSellersFromSupabase() {
  if (!supabaseClient) return null;

  try {
    const { data, error } = await supabaseClient
      .from("sellers")
      .select("*");

    if (error) {
      console.warn("fetchSellers warning:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("fetchSellers exception:", error);
    return null;
  }
}


// ============================================
// ORDERS & CHECKOUT SERVICES
// ============================================

/**
 * Place a new order into Supabase database
 */
async function createOrderInSupabase(checkoutData, cartItems) {
  if (!supabaseClient) {
    return { success: false, error: "الاتصال بقاعدة البيانات غير متاح." };
  }

  try {
    const user = await getCurrentUser();
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );

    const orderPayload = {
      user_id: user ? user.id : null,
      customer_name: checkoutData.name,
      phone: checkoutData.phone,
      city: checkoutData.city,
      address: checkoutData.address,
      notes: checkoutData.notes || "",
      total_amount: totalAmount,
      status: "pending",
      created_at: new Date().toISOString()
    };

    const { data: orderData, error: orderError } = await supabaseClient
      .from("orders")
      .insert([orderPayload])
      .select();

    if (orderError) {
      console.error("createOrder error:", orderError);
      return { success: false, error: orderError.message || "فشل تسجيل الطلب" };
    }

    const createdOrder = Array.isArray(orderData) ? orderData[0] : orderData;
    const orderId = createdOrder ? createdOrder.id : null;

    if (orderId && cartItems && cartItems.length > 0) {
      const itemsPayload = cartItems.map(item => ({
        order_id: orderId,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const { error: itemsError } = await supabaseClient
        .from("order_items")
        .insert(itemsPayload);

      if (itemsError) {
        console.warn("Order items save warning:", itemsError.message);
      }
    }

    return { success: true, orderId: orderId, order: createdOrder };
  } catch (error) {
    console.error("createOrderInSupabase exception:", error);
    return { success: false, error: error.message || "حدث خطأ غير متوقع أثناء إرسال الطلب." };
  }
}


/**
 * Fetch orders for current authenticated user
 */
async function fetchUserOrdersFromSupabase() {
  const user = await getCurrentUser();
  if (!user || !supabaseClient) return [];

  try {
    const { data, error } = await supabaseClient
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("fetchUserOrders error:", error.message);
      // Fallback query without relation if order_items join fails
      const { data: simpleOrders } = await supabaseClient
        .from("orders")
        .select("*")
        .eq("user_id", user.id);
      return simpleOrders || [];
    }

    return data || [];
  } catch (error) {
    console.error("fetchUserOrders exception:", error);
    return [];
  }
}


// ============================================
// SELLER PORTAL SERVICES
// ============================================

/**
 * Register user as a seller
 */
async function registerSellerStore(storeData) {
  const user = await getCurrentUser();
  if (!user || !supabaseClient) {
    return { success: false, error: "يرجى تسجيل الدخول أولاً." };
  }

  try {
    const sellerPayload = {
      user_id: user.id,
      store_name: storeData.storeName,
      phone: storeData.phone,
      city: storeData.city,
      description: storeData.description || "",
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseClient
      .from("sellers")
      .insert([sellerPayload])
      .select();

    if (error) {
      throw error;
    }

    // Update profile role to seller
    await supabaseClient
      .from("profiles")
      .upsert({ id: user.id, role: "seller" });

    return { success: true, data: data };
  } catch (error) {
    console.error("registerSellerStore error:", error);
    return { success: false, error: error.message || "فشل تسجيل المتجر." };
  }
}


/**
 * Add product as a seller
 */
async function addSellerProduct(productData) {
  if (!supabaseClient) {
    return { success: false, error: "الاتصال بقاعدة البيانات غير متاح." };
  }

  try {
    const payload = {
      name: productData.name,
      price: productData.price,
      description: productData.description || "",
      image_url: productData.imageUrl || "",
      is_active: true,
      seller_id: productData.seller_id,
      category_id: productData.category_id,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabaseClient
      .from("products")
      .insert([payload])
      .select();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("addSellerProduct error:", error);
    return { success: false, error: error.message || "فشل إضافة المنتج." };
  }
}


// ============================================
// AUTH STATE LISTENER
// ============================================

if (supabaseClient) {
  supabaseClient.auth.onAuthStateChange(function (event, session) {
    console.log("Syria Market auth event:", event);

    if (typeof window.updateUserStatus === "function") {
      window.updateUserStatus();
    }
  });
}
