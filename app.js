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
// AUTHENTICATION SERVICES & ARABIC ERROR MAPPER
// ============================================

/**
 * Translate Supabase Auth errors into clear, friendly Arabic messages
 */
function translateAuthError(message) {
  if (!message) return "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.";
  const msg = String(message).toLowerCase();

  if (msg.includes("rate limit") || msg.includes("email rate limit exceeded")) {
    return "تم تجاوز حد إرسال الرسائل المؤقت في الخدمة. يرجى الانتظار بضع دقائق ثم المحاولة مجدداً.";
  }
  if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }
  if (msg.includes("user already registered") || msg.includes("already registered") || msg.includes("user_already_exists")) {
    return "البريد الإلكتروني مسجل بالفعل. يمكنك تسجيل الدخول مباشرة.";
  }
  if (msg.includes("password should be at least")) {
    return "كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل.";
  }
  if (msg.includes("email not confirmed")) {
    return "لم يتم تأكيد البريد الإلكتروني بعد. يرجى التحقق من رسائل البريد الواردة.";
  }
  if (msg.includes("unable to validate email address") || msg.includes("invalid email")) {
    return "صيغة البريد الإلكتروني غير صحيحة.";
  }

  return message;
}


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
        },
        emailRedirectTo: window.location.origin + window.location.pathname
      }
    });

    if (error) {
      console.error("Sign up error:", error.message);
      return {
        success: false,
        error: translateAuthError(error.message)
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
      error: translateAuthError(error.message)
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
        error: translateAuthError(error.message)
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
      error: translateAuthError(error.message)
    };
  }
}


/**
 * Send password reset email
 */
async function resetPasswordForEmail(email) {
  if (!supabaseClient) {
    return {
      success: false,
      error: "الاتصال بقاعدة البيانات غير متاح."
    };
  }

  try {
    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    });

    if (error) {
      return {
        success: false,
        error: translateAuthError(error.message)
      };
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: translateAuthError(error.message)
    };
  }
}


/**
 * Update user password (used during password recovery flow)
 */
async function updateUserPassword(newPassword) {
  if (!supabaseClient) {
    return {
      success: false,
      error: "الاتصال بقاعدة البيانات غير متاح."
    };
  }

  try {
    const { data, error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return {
        success: false,
        error: translateAuthError(error.message)
      };
    }

    return {
      success: true,
      data: data
    };
  } catch (error) {
    return {
      success: false,
      error: translateAuthError(error.message)
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
      const isUUID = (str) => typeof str === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

      const itemsPayload = cartItems.map(item => ({
        order_id: orderId,
        product_id: isUUID(item.id) ? item.id : null,
        product_name: item.name,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1
      }));

      const { error: itemsError } = await supabaseClient
        .from("order_items")
        .insert(itemsPayload);

      if (itemsError) {
        console.error("Order items save error:", itemsError.message);
        return { success: false, error: "تعذر حفظ تفاصيل عناصر الطلب: " + (itemsError.message || "خطأ أثناء حفظ المنتجات") };
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
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "يرجى تسجيل الدخول كبائع لإضافة منتج." };
    }

    let sellerId = productData.sellerId || productData.seller_id || null;

    if (!sellerId) {
      const sellers = await fetchSellersFromSupabase();
      const myStore = Array.isArray(sellers) ? sellers.find(s => s.user_id === user.id) : null;
      if (myStore) {
        sellerId = myStore.id;
      }
    }

    if (!sellerId) {
      return { success: false, error: "لم يتم العثور على متجر مسجل لهذا المستخدم." };
    }

    const payload = {
      name: productData.name,
      price: productData.price,
      description: productData.description || "",
      image_url: productData.imageUrl || "",
      stock: productData.stock !== undefined ? Number(productData.stock) : 10,
      is_active: true,
      seller_id: sellerId,
      category_id: productData.categoryId || productData.category_id || null
    };

    const { data, error } = await supabaseClient
      .from("products")
      .insert([payload])
      .select("*, sellers(*), categories(*)");

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("addSellerProduct error:", error);
    return { success: false, error: error.message || "فشل إضافة المنتج." };
  }
}


/**
 * Update an existing product as a seller
 */
async function updateSellerProduct(productId, updates) {
  if (!supabaseClient) {
    return { success: false, error: "الاتصال بقاعدة البيانات غير متاح." };
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "يرجى تسجيل الدخول كبائع." };
    }

    const payload = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseClient
      .from("products")
      .update(payload)
      .eq("id", productId)
      .select("*, sellers(*), categories(*)");

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("updateSellerProduct error:", error);
    return { success: false, error: error.message || "فشل تحديث المنتج." };
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
