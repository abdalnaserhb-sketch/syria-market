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
 * Translate Supabase authentication error messages to friendly Arabic
 */
function translateAuthError(errorMessage) {
  if (!errorMessage) return "حدث خطأ غير متوقع.";
  const msg = String(errorMessage).toLowerCase();

  if (msg.includes("invalid login credentials") || msg.includes("invalid_grant")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }
  if (msg.includes("email not confirmed")) {
    return "البريد الإلكتروني لم يتم تأكيده بعد. يرجى مراجعة صندوق البريد.";
  }
  if (msg.includes("user already registered") || msg.includes("already exists")) {
    return "البريد الإلكتروني مُسجّل بالفعل. يمكنك تسجيل الدخول مباشرة.";
  }
  if (msg.includes("password should be at least")) {
    return "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";
  }
  if (msg.includes("rate limit") || msg.includes("too many requests")) {
    return "تم تجاوز حد المحاولات. يرجى الانتظار دقيقة ثم المحاولة مجدداً.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "تعذر الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.";
  }
  return errorMessage;
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
async function requestPasswordReset(email) {
  if (!supabaseClient) {
    return { success: false, error: "الاتصال بقاعدة البيانات غير متاح." };
  }

  try {
    const { data, error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname
    });

    if (error) {
      return { success: false, error: translateAuthError(error.message) };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: translateAuthError(error.message) };
  }
}

/**
 * Update current user's password (e.g. after recovery link)
 */
async function updateUserPassword(newPassword) {
  if (!supabaseClient) {
    return { success: false, error: "الاتصال بقاعدة البيانات غير متاح." };
  }

  try {
    const { data, error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });

    if (error) {
      return { success: false, error: translateAuthError(error.message) };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: translateAuthError(error.message) };
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
 * Update product details or stock as seller with strict ownership verification
 */
async function updateSellerProduct(productId, updates) {
  if (!supabaseClient) {
    return { success: false, error: "الاتصال بقاعدة البيانات غير متاح." };
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "يرجى تسجيل الدخول كبائع لتعديل المنتج." };
    }

    // Resolve user's seller_id from database
    const sellers = await fetchSellersFromSupabase();
    const myStore = Array.isArray(sellers) ? sellers.find(s => String(s.user_id) === String(user.id)) : null;

    if (!myStore) {
      return { success: false, error: "غير مصرح: لم يتم العثور على متجر لهذا حساب." };
    }

    // Verify product ownership before updating
    const { data: targetProduct, error: fetchErr } = await supabaseClient
      .from("products")
      .select("id, seller_id")
      .eq("id", productId)
      .maybeSingle();

    if (fetchErr || !targetProduct) {
      return { success: false, error: "المنتج غير موجود." };
    }

    if (String(targetProduct.seller_id) !== String(myStore.id)) {
      return { success: false, error: "غير مصرح: لا يمكنك تعديل منتجات متجر آخر." };
    }

    const payload = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseClient
      .from("products")
      .update(payload)
      .eq("id", productId)
      .eq("seller_id", myStore.id)
      .select("*, sellers(*), categories(*)");

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("updateSellerProduct error:", error);
    return { success: false, error: translateAuthError(error.message) || "فشل تحديث المنتج" };
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

    // Also update auth user metadata if full_name is provided
    if (profileData.full_name) {
      await supabaseClient.auth.updateUser({
        data: { full_name: profileData.full_name }
      }).catch(e => console.warn("updateUser metadata warning:", e));
    }

    return { success: true, data };
  } catch (error) {
    console.error("updateUserProfile error:", error);
    return { success: false, error: translateAuthError(error.message) || "فشل تحديث البيانات الشخصية" };
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
      return { success: false, error: translateAuthError(orderError.message) || "فشل تسجيل الطلب." };
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
        console.error("Order items save error. Rolling back order:", itemsError.message);
        // Clean rollback: delete order so no orphan incomplete order exists
        await supabaseClient.from("orders").delete().eq("id", orderId).catch(e => console.error("Rollback error:", e));
        return { success: false, error: "تعذر حفظ تفاصيل عناصر الطلب. تم إلغاء الطلب ولم يتم خصم أو إتمام العملية." };
      }
    }

    return { success: true, orderId: orderId, order: createdOrder };
  } catch (error) {
    console.error("createOrderInSupabase exception:", error);
    return { success: false, error: translateAuthError(error.message) || "حدث خطأ غير متوقع أثناء إرسال الطلب." };
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
 * Add product as a seller with strict seller_id resolution from authenticated user
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

    // Always resolve seller_id strictly from the database for the authenticated user
    const sellers = await fetchSellersFromSupabase();
    const myStore = Array.isArray(sellers) ? sellers.find(s => String(s.user_id) === String(user.id)) : null;

    if (!myStore) {
      return { success: false, error: "لم يتم العثور على متجر مسجل لهذا المستخدم." };
    }

    const payload = {
      name: productData.name,
      price: productData.price,
      stock: productData.stock !== undefined && productData.stock !== null ? Number(productData.stock) : 10,
      description: productData.description || "",
      image_url: productData.imageUrl || productData.image_url || "",
      is_active: productData.is_active !== undefined ? Boolean(productData.is_active) : true,
      seller_id: myStore.id,
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
    return { success: false, error: translateAuthError(error.message) || "فشل إضافة المنتج." };
  }
}


// ============================================
// ADMIN READY HELPER SERVICES
// ============================================

/**
 * Check if the currently logged in user has admin role
 */
async function isUserAdmin() {
  const profile = await getUserProfile();
  return profile && (profile.role === "admin" || profile.role === "administrator");
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
