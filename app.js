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
// CUSTOMER, AI & PAYMENT MARKETPLACE SERVICES
// ============================================

/**
 * Syrian Arabic AI Shopping Assistant query parser and product recommender
 */
function parseAIShoppingAssistantQuery(userPrompt, productsList = []) {
  if (!userPrompt || typeof userPrompt !== "string") {
    return {
      reply: "أهلاً بك! أنا مساعد التسوق الذكي في Syria Market. كيف يمكنني مساعدتك اليوم؟",
      recommendations: []
    };
  }

  const text = userPrompt.toLowerCase();

  // Extract budget if mentioned (e.g. 4 ملايين, 500 ألف, 2500000)
  let maxBudget = null;
  if (text.includes("مليون") || text.includes("ملايين")) {
    const numMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:مليون|ملايين)/);
    if (numMatch) {
      maxBudget = parseFloat(numMatch[1]) * 1000000;
    }
  } else if (text.includes("ألف") || text.includes("آلاف")) {
    const numMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:ألف|آلاف)/);
    if (numMatch) {
      maxBudget = parseFloat(numMatch[1]) * 1000;
    }
  } else {
    const directMatch = text.match(/(\d{5,8})/);
    if (directMatch) {
      maxBudget = parseFloat(directMatch[1]);
    }
  }

  // Keywords matching
  let matches = Array.isArray(productsList) ? [...productsList] : [];

  if (maxBudget) {
    matches = matches.filter(p => Number(p.price) <= maxBudget);
  }

  if (text.includes("موبايل") || text.includes("هاتف") || text.includes("جوال") || text.includes("تصوير") || text.includes("ألعاب")) {
    matches = matches.filter(p =>
      (p.category && p.category.includes("إلكترونيات")) ||
      (p.name && (p.name.includes("هاتف") || p.name.includes("ذكي") || p.name.includes("سماعة")))
    );
  } else if (text.includes("لبس") || text.includes("ألبسة") || text.includes("حذاء") || text.includes("ملابس")) {
    matches = matches.filter(p => p.category && p.category.includes("ألبسة"));
  } else if (text.includes("منزل") || text.includes("بيت") || text.includes("فنجان") || text.includes("أثاث")) {
    matches = matches.filter(p => p.category && p.category.includes("منزل"));
  }

  // Sort best options by price or relevance
  matches.sort((a, b) => b.price - a.price);
  const topRecommendations = matches.slice(0, 3);

  let replyText = "";
  if (topRecommendations.length > 0) {
    replyText = `بناءً على طلبك ("${userPrompt.trim()}"): ${maxBudget ? `ضمن ميزانية تصل إلى ${new Intl.NumberFormat("ar-SY").format(maxBudget)} ل.س، ` : ""}إليك أفضل الخيارات المقترحة من Syria Market:`;
  } else {
    replyText = `لم أجد منتجات مطابقة تماماً لمواصفاتك والميزانية المحددة ("${userPrompt.trim()}"). إليك بعض المنتجات الشائعة في السوق السوري:`;
  }

  return {
    reply: replyText,
    recommendations: topRecommendations.length > 0 ? topRecommendations : productsList.slice(0, 3)
  };
}

/**
 * Local Wishlists management
 */
function getWishlistsFromStorage() {
  try {
    const saved = localStorage.getItem("syriaMarketWishlists");
    return saved ? JSON.parse(saved) : { "قائمة الرغبات": [] };
  } catch (e) {
    return { "قائمة الرغبات": [] };
  }
}

function saveWishlistsToStorage(wishlists) {
  try {
    localStorage.setItem("syriaMarketWishlists", JSON.stringify(wishlists));
  } catch (e) {
    console.warn("Wishlist storage error:", e);
  }
}

/**
 * Payment Providers status configuration
 */
function getPaymentProvidersStatus() {
  return [
    {
      id: "cod",
      name: "الدفع عند الاستلام (Cash on Delivery)",
      icon: "💵",
      enabled: true,
      description: "الدفع نقداً للشاعر/الموصل عند استلام الطلب",
      statusText: "مفعّل ورسمي 🟢"
    },
    {
      id: "sham_cash",
      name: "شام كاش (Sham Cash)",
      icon: "💳",
      enabled: false,
      description: "الدفع عبر تطبيق شام كاش الإلكتروني",
      statusText: "الدفع عبر شام كاش غير مفعّل حالياً - يتطلب ضبط مفاتيح التاجر ⚠️"
    },
    {
      id: "bank_transfer",
      name: "حوالة بنكية / المصرف التجاري",
      icon: "🏦",
      enabled: true,
      description: "تحويل لمصرف بيمو أو المصرف التجاري السوري مع إرفاق إشعار التحويل",
      statusText: "مفعّل (تحقق يدوي) 🔵"
    },
    {
      id: "ecash",
      name: "إي كاش (E-Cash)",
      icon: "📱",
      enabled: false,
      description: "الدفع عبر بوابة إي كاش الوطنية",
      statusText: "غير مفعّل حالياً - يتطلب ضبط الإعدادات ⚠️"
    },
    {
      id: "card",
      name: "بطاقات الفيزا والماستركارد الدولية",
      icon: "💳",
      enabled: false,
      description: "الدفع عبر بطاقات الائتمان الدولية",
      statusText: "غير مفعّل حالياً - يتطلب بوابة دفع معتمدة ⚠️"
    }
  ];
}

/**
 * Coupon Validator
 */
function validateCouponCode(code, totalAmount) {
  if (!code || typeof code !== "string") return { valid: false, error: "رمز الكوبون غير صحيح." };
  const cleanCode = code.trim().toUpperCase();

  const COUPONS = {
    "SYRIA10": { type: "percent", value: 10, minOrder: 50000, desc: "خصم 10% على جميع الطلبات فوق 50,000 ل.س" },
    "WELCOME": { type: "percent", value: 15, minOrder: 100000, desc: "خصم 15% للطلب الأول فوق 100,000 ل.س" },
    "MARKET2026": { type: "fixed", value: 25000, minOrder: 200000, desc: "خصم بقيمة 25,000 ل.س للطلبات الكبيرة" }
  };

  const coupon = COUPONS[cleanCode];
  if (!coupon) {
    return { valid: false, error: "رمز الكوبون غير موجود أو منتهي الصلاحية." };
  }

  if (totalAmount < coupon.minOrder) {
    return {
      valid: false,
      error: `هذا الكوبون يتطلب حداً أدنى للطلب بقيمة ${new Intl.NumberFormat("ar-SY").format(coupon.minOrder)} ل.س.`
    };
  }

  let discountAmount = 0;
  if (coupon.type === "percent") {
    discountAmount = (totalAmount * coupon.value) / 100;
  } else {
    discountAmount = coupon.value;
  }

  return {
    valid: true,
    code: cleanCode,
    discountAmount: Math.min(discountAmount, totalAmount),
    desc: coupon.desc
  };
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

/**
 * Fetch overview statistics for Admin Dashboard
 */
async function fetchAdminDashboardStats() {
  if (!supabaseClient) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalSellers: 0,
      totalProducts: 0,
      lowStockCount: 0,
      pendingOrdersCount: 0,
      pendingSellersCount: 0
    };
  }

  try {
    const isAdmin = await isUserAdmin();
    if (!isAdmin) {
      return { error: "غير مصرح: هذه العملية تتطلب صلاحيات المشرف." };
    }

    const [ordersRes, sellersRes, productsRes, profilesRes] = await Promise.all([
      supabaseClient.from("orders").select("id, total_amount, status"),
      supabaseClient.from("sellers").select("id, store_name"),
      supabaseClient.from("products").select("id, stock, is_active"),
      supabaseClient.from("profiles").select("id, role")
    ]);

    const orders = ordersRes.data || [];
    const sellers = sellersRes.data || [];
    const products = productsRes.data || [];
    const profiles = profilesRes.data || [];

    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const lowStockCount = products.filter(p => Number(p.stock) <= 3).length;
    const pendingOrdersCount = orders.filter(o => o.status === "pending" || o.status === "قيد الانتظار").length;
    const totalCustomers = profiles.filter(p => p.role === "customer" || !p.role).length;

    return {
      success: true,
      stats: {
        totalRevenue,
        totalOrders: orders.length,
        totalCustomers,
        totalSellers: sellers.length,
        totalProducts: products.length,
        lowStockCount,
        pendingOrdersCount,
        pendingSellersCount: 0
      }
    };
  } catch (error) {
    console.error("fetchAdminDashboardStats error:", error);
    return { error: "فشل تحميل إحصائيات المشرف." };
  }
}

/**
 * Fetch all orders for Admin Management
 */
async function fetchAdminAllOrders() {
  if (!supabaseClient) return [];
  const isAdmin = await isUserAdmin();
  if (!isAdmin) return [];

  try {
    const { data, error } = await supabaseClient
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("fetchAdminAllOrders error:", error);
    return [];
  }
}

/**
 * Update order status as Admin
 */
async function updateOrderStatusByAdmin(orderId, newStatus) {
  if (!supabaseClient) return { success: false, error: "الاتصال بقاعدة البيانات غير متاح." };
  const isAdmin = await isUserAdmin();
  if (!isAdmin) return { success: false, error: "غير مصرح: تتطلب صلاحيات المشرف." };

  try {
    const { data, error } = await supabaseClient
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId)
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("updateOrderStatusByAdmin error:", error);
    return { success: false, error: translateAuthError(error.message) || "فشل تحديث حالة الطلب" };
  }
}

/**
 * Add category as Admin
 */
async function addCategoryByAdmin(categoryName, icon = "📦") {
  if (!supabaseClient) return { success: false, error: "الاتصال بقاعدة البيانات غير متاح." };
  const isAdmin = await isUserAdmin();
  if (!isAdmin) return { success: false, error: "غير مصرح." };

  try {
    const { data, error } = await supabaseClient
      .from("categories")
      .insert([{ name: categoryName, icon: icon, created_at: new Date().toISOString() }])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("addCategoryByAdmin error:", error);
    return { success: false, error: translateAuthError(error.message) || "فشل إضافة التصنيف." };
  }
}

/**
 * Delete category as Admin
 */
async function deleteCategoryByAdmin(categoryId) {
  if (!supabaseClient) return { success: false, error: "الاتصال بقاعدة البيانات غير متاح." };
  const isAdmin = await isUserAdmin();
  if (!isAdmin) return { success: false, error: "غير مصرح." };

  try {
    const { error } = await supabaseClient
      .from("categories")
      .delete()
      .eq("id", categoryId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("deleteCategoryByAdmin error:", error);
    return { success: false, error: translateAuthError(error.message) || "فشل حذف التصنيف." };
  }
}

/**
 * Fetch seller performance analytics
 */
async function fetchSellerAnalytics() {
  const user = await getCurrentUser();
  if (!user || !supabaseClient) return null;

  try {
    const sellers = await fetchSellersFromSupabase();
    const myStore = Array.isArray(sellers) ? sellers.find(s => String(s.user_id) === String(user.id)) : null;

    if (!myStore) return null;

    const products = await fetchProductsFromSupabase();
    const myProducts = Array.isArray(products)
      ? products.filter(p => String(p.seller_id) === String(myStore.id) || p.sellers?.store_name === myStore.store_name)
      : [];

    const totalProducts = myProducts.length;
    const activeProducts = myProducts.filter(p => p.is_active !== false).length;
    const lowStockProducts = myProducts.filter(p => Number(p.stock) <= 3);

    return {
      storeName: myStore.store_name,
      totalProducts,
      activeProducts,
      lowStockProducts,
      myProducts
    };
  } catch (error) {
    console.error("fetchSellerAnalytics error:", error);
    return null;
  }
}

/**
 * Validate CSV import string for product bulk creation
 */
function parseProductCSV(csvText) {
  if (!csvText || typeof csvText !== "string") {
    return { success: false, error: "نص CSV فارغ أو غير صحيح." };
  }

  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return { success: false, error: "ملف CSV يجب أن يحتوي على سطر الترويسة وسطراً واحداً على الأقل من البيانات." };
  }

  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  const parsedProducts = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map(c => c.trim().replace(/^"(.*)"$/, "$1"));
    if (cols.length < 2) continue;

    const nameIndex = headers.indexOf("name") !== -1 ? headers.indexOf("name") : 0;
    const priceIndex = headers.indexOf("price") !== -1 ? headers.indexOf("price") : 1;
    const stockIndex = headers.indexOf("stock") !== -1 ? headers.indexOf("stock") : 2;
    const descIndex = headers.indexOf("description") !== -1 ? headers.indexOf("description") : 3;

    const name = cols[nameIndex] || `منتج مستورد ${i}`;
    const price = Number(cols[priceIndex]) || 0;
    const stock = Number(cols[stockIndex]) || 10;
    const description = cols[descIndex] || "";

    parsedProducts.push({ name, price, stock, description });
  }

  return { success: true, products: parsedProducts };
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
