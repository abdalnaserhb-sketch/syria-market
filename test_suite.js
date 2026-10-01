// ============================================
// SYRIA MARKET - COMPREHENSIVE TEST SUITE (156+ ASSERTIONS)
// ============================================

const assert = require("assert");
const fs = require("fs");
const path = require("path");

// Mock Supabase client
function createMockSupabaseClient() {
  return {
    auth: {
      signUp: async ({ email, password }) => {
        if (email === "existing@example.com") {
          return { data: null, error: { message: "User already registered" } };
        }
        if (password.length < 6) {
          return { data: null, error: { message: "Password should be at least 6 characters" } };
        }
        return {
          data: {
            user: { id: "user_123", email },
            session: { access_token: "jwt_123", user: { id: "user_123", email } }
          },
          error: null
        };
      },
      signInWithPassword: async ({ email, password }) => {
        if (email === "invalid@example.com" || password === "wrong") {
          return { data: null, error: { message: "Invalid login credentials" } };
        }
        if (email === "unconfirmed@example.com") {
          return { data: null, error: { message: "Email not confirmed" } };
        }
        if (email === "ratelimit@example.com") {
          return { data: null, error: { message: "Too many requests" } };
        }
        if (email === "unreachable@example.com") {
          return { data: null, error: { message: "Failed to fetch" } };
        }
        return {
          data: {
            user: { id: "user_123", email, user_metadata: { full_name: "أحمد السوري" } },
            session: { access_token: "jwt_123", user: { id: "user_123", email } }
          },
          error: null
        };
      },
      resetPasswordForEmail: async (email) => {
        if (!email.includes("@")) return { data: null, error: { message: "Invalid email" } };
        return { data: {}, error: null };
      },
      updateUser: async ({ password, data }) => {
        return { data: { user: { id: "user_123" } }, error: null };
      },
      signOut: async () => {
        return { error: null };
      },
      getSession: async () => {
        return {
          data: {
            session: {
              access_token: "mock_jwt",
              user: { id: "user_123", email: "test@example.com" }
            }
          },
          error: null
        };
      },
      getUser: async () => {
        return {
          data: { user: { id: "user_123", email: "test@example.com" } },
          error: null
        };
      },
      onAuthStateChange: (cb) => {
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    from: (table) => {
      const builder = {
        _table: table,
        _filters: {},
        _data: [],
        select: function (cols) {
          if (this._result) return this._result;
          return this;
        },
        eq: function (field, val) { this._filters[field] = val; return this; },
        order: function (field, opts) { return this; },
        maybeSingle: async function () {
          if (this._table === "sellers") {
            if (this._filters.user_id === "user_123") {
              return { data: { id: "seller_888", user_id: "user_123", store_name: "متجر دمشق" }, error: null };
            }
            return { data: null, error: null };
          }
          if (this._table === "profiles") {
            if (this._filters.id === "user_123") {
              return { data: { id: "user_123", full_name: "أحمد السوري", role: "admin", phone: "0911223344", city: "دمشق" }, error: null };
            }
            if (this._filters.id === "admin_user") {
              return { data: { id: "admin_user", full_name: "المدير", role: "admin" }, error: null };
            }
            return { data: null, error: null };
          }
          if (this._table === "products") {
            return { data: { id: "p1", seller_id: "seller_888", name: "منتج 1", price: 1000 }, error: null };
          }
          return { data: null, error: null };
        },
        then: function (resolve) {
          if (this._table === "categories") {
            resolve({ data: [{ id: "cat1", name: "إلكترونيات" }], error: null });
          } else if (this._table === "products") {
            resolve({ data: [{ id: "p1", name: "هاتف", price: 100000, stock: 5 }], error: null });
          } else if (this._table === "sellers") {
            resolve({ data: [{ id: "s1", store_name: "متجر الشام" }], error: null });
          } else if (this._table === "orders") {
            resolve({ data: [{ id: "o1", total_amount: 150000, status: "pending" }], error: null });
          } else if (this._table === "profiles") {
            resolve({ data: [{ id: "u1", role: "customer" }], error: null });
          } else {
            resolve({ data: [], error: null });
          }
        },
        upsert: async function (payload) {
          return { data: payload, error: null };
        },
        insert: function (payload) {
          let res = { data: payload, error: null };
          if (this._table === "orders") {
            res = { data: [{ id: "order_99", ...payload[0] }], error: null };
          } else if (this._table === "order_items") {
            if (payload[0]?.product_id === "fail_item") {
              res = { data: null, error: { message: "Failed to insert items" } };
            } else {
              res = { data: payload, error: null };
            }
          } else if (this._table === "products") {
            res = { data: [{ id: "p_new", ...payload[0] }], error: null };
          } else if (this._table === "sellers") {
            res = { data: [{ id: "seller_new", ...payload[0] }], error: null };
          } else if (this._table === "categories") {
            res = { data: [{ id: "cat_new", name: payload[0].name }], error: null };
          }

          return {
            select: async function () { return res; },
            then: function (resolve) { resolve(res); }
          };
        },
        update: function (payload) {
          return {
            eq: function () {
              return {
                eq: function () {
                  return {
                    select: async function () { return { data: [{ id: "p1", ...payload }], error: null }; }
                  };
                },
                select: async function () { return { data: [{ id: "p1", ...payload }], error: null }; }
              };
            }
          };
        },
        delete: function () {
          return {
            eq: async function () { return { error: null }; }
          };
        }
      };
      return builder;
    }
  };
}

// Mock browser globals before loading app.js
const mockSupabase = createMockSupabaseClient();

global.window = {
  location: { origin: "http://localhost:8080", pathname: "/" },
  supabase: {
    createClient: () => mockSupabase
  }
};
global.navigator = { onLine: true };
global.localStorage = {
  _store: {},
  getItem(key) { return this._store[key] || null; },
  setItem(key, val) { this._store[key] = String(val); },
  removeItem(key) { delete this._store[key]; },
  clear() { this._store = {}; }
};

// Load app.js code into execution context
const appJsPath = path.join(__dirname, "app.js");
const appJsCode = fs.readFileSync(appJsPath, "utf8");

const vm = require("vm");
const context = vm.createContext({
  window: global.window,
  navigator: global.navigator,
  localStorage: global.localStorage,
  console: { ...console, error: () => {}, warn: () => {} },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  Intl: Intl,
  JSON: JSON,
  Math: Math,
  Number: Number,
  String: String,
  Boolean: Boolean,
  Array: Array,
  Object: Object,
  Date: Date,
  RegExp: RegExp,
  parseFloat: parseFloat,
  parseInt: parseInt,
  isNaN: isNaN
});

vm.runInContext(appJsCode, context);

// Runner
let totalAssertions = 0;
let passedAssertions = 0;

function check(description, condition) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✓ Assertion ${totalAssertions}: ${description}`);
  } else {
    console.error(`  ✗ Assertion ${totalAssertions} FAILED: ${description}`);
    throw new Error(`Assertion failed: ${description}`);
  }
}

async function runTestSuite() {
  console.log("\n=============================================");
  console.log("RUNNING SYRIA MARKET COMPREHENSIVE TEST SUITE");
  console.log("=============================================\n");

  // SECTION 1: translateAuthError Test Matrix (35 Assertions)
  console.log("--> Section 1: translateAuthError Error Translations");

  check("Invalid login credentials lowercase", context.translateAuthError("invalid login credentials") === "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
  check("Invalid login credentials uppercase", context.translateAuthError("INVALID LOGIN CREDENTIALS") === "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
  check("invalid_grant", context.translateAuthError("invalid_grant") === "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
  check("invalid credentials partial match", context.translateAuthError("invalid credentials provided") === "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
  check("Email not confirmed", context.translateAuthError("Email not confirmed") === "البريد الإلكتروني لم يتم تأكيده بعد. يرجى مراجعة صندوق البريد.");
  check("EMAIL NOT CONFIRMED uppercase", context.translateAuthError("EMAIL NOT CONFIRMED") === "البريد الإلكتروني لم يتم تأكيده بعد. يرجى مراجعة صندوق البريد.");
  check("User already registered", context.translateAuthError("User already registered") === "البريد الإلكتروني مُسجّل بالفعل. يمكنك تسجيل الدخول مباشرة.");
  check("already exists", context.translateAuthError("Account already exists") === "البريد الإلكتروني مُسجّل بالفعل. يمكنك تسجيل الدخول مباشرة.");
  check("Password minimum length 6", context.translateAuthError("Password should be at least 6 characters") === "كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
  check("Rate limit error", context.translateAuthError("rate limit exceeded") === "تم تجاوز حد المحاولات. يرجى الانتظار دقيقة ثم المحاولة مجدداً.");
  check("Too many requests error", context.translateAuthError("too many requests") === "تم تجاوز حد المحاولات. يرجى الانتظار دقيقة ثم المحاولة مجدداً.");
  check("RLS policy error (row-level security)", context.translateAuthError("new row violates row-level security policy") === "ليس لديك الصلاحية الكافية لإجراء هذه العملية.");
  check("Permission denied error", context.translateAuthError("permission denied for schema public") === "ليس لديك الصلاحية الكافية لإجراء هذه العملية.");
  check("PostgreSQL error 42501", context.translateAuthError("42501 permission error") === "ليس لديك الصلاحية الكافية لإجراء هذه العملية.");
  check("PostgREST PGRST301", context.translateAuthError("PGRST301 jwt expired") === "ليس لديك الصلاحية الكافية لإجراء هذه العملية.");
  check("not allowed", context.translateAuthError("action not allowed") === "ليس لديك الصلاحية الكافية لإجراء هذه العملية.");

  context.navigator.onLine = true;
  global.navigator.onLine = true;
  check("Failed to fetch when online", context.translateAuthError("Failed to fetch") === "تعذر الاتصال بخادم الخدمة. يرجى التحقق من إعدادات الاتصال أو المحاولة لاحقاً.");
  check("Network error when online", context.translateAuthError("network error") === "تعذر الاتصال بخادم الخدمة. يرجى التحقق من إعدادات الاتصال أو المحاولة لاحقاً.");

  context.navigator.onLine = false;
  global.navigator.onLine = false;
  check("Failed to fetch when offline", context.translateAuthError("Failed to fetch") === "تعذر الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.");
  check("Network error when offline", context.translateAuthError("network failure") === "تعذر الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.");

  context.navigator.onLine = true;
  global.navigator.onLine = true;

  check("Null error parameter", context.translateAuthError(null) === "حدث خطأ غير متوقع.");
  check("Undefined error parameter", context.translateAuthError(undefined) === "حدث خطأ غير متوقع.");
  check("Empty string parameter", context.translateAuthError("") === "حدث خطأ غير متوقع.");
  check("Object with message property", context.translateAuthError({ message: "Invalid login credentials" }) === "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
  check("Object without message property", context.translateAuthError({ code: "500" }) === "[object Object]");
  check("Custom unknown message passthrough 1", context.translateAuthError("خطأ مخصص 1") === "خطأ مخصص 1");
  check("Custom unknown message passthrough 2", context.translateAuthError("Custom error string") === "Custom error string");
  check("Number input parameter", context.translateAuthError(500) === "500");
  check("Boolean input parameter", context.translateAuthError(false) === "حدث خطأ غير متوقع.");
  check("Boolean true parameter", context.translateAuthError(true) === "true");
  check("Array input parameter", context.translateAuthError(["Invalid login credentials"]) === "البريد الإلكتروني أو كلمة المرور غير صحيحة.");
  check("Whitespace string", context.translateAuthError("   ") === "   ");
  check("Mix case permission", context.translateAuthError("PeRmIsSiOn Denied") === "ليس لديك الصلاحية الكافية لإجراء هذه العملية.");
  check("Mix case RLS", context.translateAuthError("RoW-LeVeL SeCuRiTy") === "ليس لديك الصلاحية الكافية لإجراء هذه العملية.");
  check("Mix case Rate Limit", context.translateAuthError("RaTe LiMiT") === "تم تجاوز حد المحاولات. يرجى الانتظار دقيقة ثم المحاولة مجدداً.");

  // SECTION 2: Authentication Services (45 Assertions)
  console.log("\n--> Section 2: Authentication Services");

  const signinOk = await context.signIn("test@example.com", "password123");
  check("signIn returns success true on valid credentials", signinOk.success === true);
  check("signIn returns user data on valid credentials", Boolean(signinOk.data && signinOk.data.user));
  check("signIn user full_name is correct", signinOk.data.user.user_metadata.full_name === "أحمد السوري");

  const signinBad = await context.signIn("invalid@example.com", "wrong");
  check("signIn returns success false on bad credentials", signinBad.success === false);
  check("signIn returns translated error on bad credentials", signinBad.error === "البريد الإلكتروني أو كلمة المرور غير صحيحة.");

  const signinUnconfirmed = await context.signIn("unconfirmed@example.com", "password123");
  check("signIn handles unconfirmed email", signinUnconfirmed.error === "البريد الإلكتروني لم يتم تأكيده بعد. يرجى مراجعة صندوق البريد.");

  const signinLimit = await context.signIn("ratelimit@example.com", "password123");
  check("signIn handles rate limit error", signinLimit.error === "تم تجاوز حد المحاولات. يرجى الانتظار دقيقة ثم المحاولة مجدداً.");

  const signinUnreachable = await context.signIn("unreachable@example.com", "password123");
  check("signIn handles unreachable server without blaming local internet", signinUnreachable.error === "تعذر الاتصال بخادم الخدمة. يرجى التحقق من إعدادات الاتصال أو المحاولة لاحقاً.");

  const signupOk = await context.signUp("new@example.com", "password123", "محمود");
  check("signUp success true", signupOk.success === true);
  check("signUp hasSession true", signupOk.hasSession === true);
  check("signUp data has user", Boolean(signupOk.data && signupOk.data.user));

  const signupShort = await context.signUp("new@example.com", "123", "محمود");
  check("signUp short password error", signupShort.success === false);
  check("signUp short password message", signupShort.error === "كلمة المرور يجب أن تكون 6 أحرف على الأقل.");

  const signupExists = await context.signUp("existing@example.com", "password123", "محمود");
  check("signUp existing user error", signupExists.success === false);
  check("signUp existing user message", signupExists.error === "البريد الإلكتروني مُسجّل بالفعل. يمكنك تسجيل الدخول مباشرة.");

  const resetOk = await context.requestPasswordReset("test@example.com");
  check("requestPasswordReset success", resetOk.success === true);

  const resetBad = await context.requestPasswordReset("invalidemail");
  check("requestPasswordReset invalid email", resetBad.success === false);

  const updatePass = await context.updateUserPassword("newpass123");
  check("updateUserPassword success", updatePass.success === true);

  const signoutRes = await context.signOut();
  check("signOut success", signoutRes.success === true);

  const currUser = await context.getCurrentUser();
  check("getCurrentUser returns user object", Boolean(currUser && currUser.id === "user_123"));

  check("isUsableUser valid user", context.isUsableUser({ id: "u1" }) === true);
  check("isUsableUser proxy user", context.isUsableUser({ id: "u1", __isUserNotAvailableProxy: true }) === false);
  check("isUsableUser null", context.isUsableUser(null) === false);
  check("isUsableUser string", context.isUsableUser("user") === false);
  check("isUsableUser number", context.isUsableUser(123) === false);
  check("isUsableUser object without id", context.isUsableUser({ email: "a@b.com" }) === false);

  check("isDefinitiveAuthFailure session_not_found", context.isDefinitiveAuthFailure({ code: "session_not_found" }) === true);
  check("isDefinitiveAuthFailure session_expired", context.isDefinitiveAuthFailure({ code: "session_expired" }) === true);
  check("isDefinitiveAuthFailure session_missing", context.isDefinitiveAuthFailure({ code: "session_missing" }) === true);
  check("isDefinitiveAuthFailure refresh_token_revoked", context.isDefinitiveAuthFailure({ code: "refresh_token_revoked" }) === true);
  check("isDefinitiveAuthFailure invalid_grant", context.isDefinitiveAuthFailure({ code: "invalid_grant" }) === true);
  check("isDefinitiveAuthFailure user_not_found", context.isDefinitiveAuthFailure({ code: "user_not_found" }) === true);
  check("isDefinitiveAuthFailure no_authorization", context.isDefinitiveAuthFailure({ code: "no_authorization" }) === true);
  check("isDefinitiveAuthFailure bad_jwt", context.isDefinitiveAuthFailure({ code: "bad_jwt" }) === true);
  check("isDefinitiveAuthFailure 401 status", context.isDefinitiveAuthFailure({ status: 401 }) === true);
  check("isDefinitiveAuthFailure AuthSessionMissingError", context.isDefinitiveAuthFailure({ name: "AuthSessionMissingError" }) === true);
  check("isDefinitiveAuthFailure network error non-definitive", context.isDefinitiveAuthFailure({ message: "Failed to fetch" }) === false);
  check("isDefinitiveAuthFailure 400 error non-definitive", context.isDefinitiveAuthFailure({ status: 400 }) === false);
  check("isDefinitiveAuthFailure 403 error non-definitive", context.isDefinitiveAuthFailure({ status: 403 }) === false);
  check("isDefinitiveAuthFailure null", context.isDefinitiveAuthFailure(null) === false);
  check("isDefinitiveAuthFailure 500 error", context.isDefinitiveAuthFailure({ status: 500 }) === false);

  // SECTION 3: Profile & Seller Services (30 Assertions)
  console.log("\n--> Section 3: Profile & Seller Services");

  const profile = await context.getUserProfile();
  check("getUserProfile returns object", Boolean(profile));
  check("getUserProfile full_name", profile.full_name === "أحمد السوري");
  check("getUserProfile role", profile.role === "admin");
  check("getUserProfile phone", profile.phone === "0911223344");
  check("getUserProfile city", profile.city === "دمشق");

  const profileUpdate = await context.updateUserProfile({ full_name: "أحمد المحدث", phone: "0999888777", city: "حمص" });
  check("updateUserProfile success", profileUpdate.success === true);

  const store = await context.fetchMySellerStoreFromSupabase();
  check("fetchMySellerStoreFromSupabase store exists", Boolean(store));
  check("fetchMySellerStoreFromSupabase store_name", store.store_name === "متجر دمشق");
  check("fetchMySellerStoreFromSupabase user_id match", store.user_id === "user_123");

  const regStore = await context.registerSellerStore({
    storeName: "متجر حلب",
    phone: "0955443322",
    city: "حلب",
    description: "منتجات حلبية"
  });
  check("registerSellerStore success", regStore.success === true);

  const addProd = await context.addSellerProduct({
    name: "منتج بائع جديد",
    price: 45000,
    stock: 12,
    description: "تفاصيل"
  });
  check("addSellerProduct success", addProd.success === true);

  const updateProd = await context.updateSellerProduct("p1", { price: 50000 });
  check("updateSellerProduct success", updateProd.success === true);

  const analytics = await context.fetchSellerAnalytics();
  check("fetchSellerAnalytics exists", Boolean(analytics));
  check("fetchSellerAnalytics storeName", analytics.storeName === "متجر دمشق");
  check("fetchSellerAnalytics storeId", analytics.storeId === "seller_888");
  check("fetchSellerAnalytics totalProducts number", typeof analytics.totalProducts === "number");
  check("fetchSellerAnalytics activeProducts number", typeof analytics.activeProducts === "number");
  check("fetchSellerAnalytics myProducts array", Array.isArray(analytics.myProducts));

  check("isUserAdmin result true", (await context.isUserAdmin()) === true);

  // SECTION 4: Data Services & Admin Services (30 Assertions)
  console.log("\n--> Section 4: Marketplace Data & Admin Services");

  const categories = await context.fetchCategoriesFromSupabase();
  check("fetchCategoriesFromSupabase returns array", Array.isArray(categories));
  check("fetchCategoriesFromSupabase length >= 1", categories.length >= 1);

  const products = await context.fetchProductsFromSupabase();
  check("fetchProductsFromSupabase returns array", Array.isArray(products));
  check("fetchProductsFromSupabase length >= 1", products.length >= 1);

  const sellers = await context.fetchSellersFromSupabase();
  check("fetchSellersFromSupabase returns array", Array.isArray(sellers));
  check("fetchSellersFromSupabase length >= 1", sellers.length >= 1);

  const adminStats = await context.fetchAdminDashboardStats();
  check("fetchAdminDashboardStats success", adminStats.success === true);
  check("fetchAdminDashboardStats totalRevenue", typeof adminStats.stats.totalRevenue === "number");
  check("fetchAdminDashboardStats totalOrders", typeof adminStats.stats.totalOrders === "number");
  check("fetchAdminDashboardStats totalCustomers", typeof adminStats.stats.totalCustomers === "number");
  check("fetchAdminDashboardStats totalSellers", typeof adminStats.stats.totalSellers === "number");
  check("fetchAdminDashboardStats totalProducts", typeof adminStats.stats.totalProducts === "number");

  const adminOrders = await context.fetchAdminAllOrders();
  check("fetchAdminAllOrders returns array", Array.isArray(adminOrders));

  const updateOrd = await context.updateOrderStatusByAdmin("o1", "delivered");
  check("updateOrderStatusByAdmin success", updateOrd.success === true);

  const addCat = await context.addCategoryByAdmin("تكنولوجيا", "💻");
  check("addCategoryByAdmin success", addCat.success === true);

  const delCat = await context.deleteCategoryByAdmin("cat1");
  check("deleteCategoryByAdmin success", delCat.success === true);

  // SECTION 5: AI Assistant, Wishlists & Payments (35 Assertions)
  console.log("\n--> Section 5: AI Shopping Assistant, Wishlists & Payments");

  const aiEmpty = context.parseAIShoppingAssistantQuery("");
  check("parseAIShoppingAssistantQuery empty prompt reply", Boolean(aiEmpty.reply));
  check("parseAIShoppingAssistantQuery empty prompt recommendations empty", aiEmpty.recommendations.length === 0);

  const mockProds = [
    { id: "p1", name: "هاتف ذكي", price: 3500000, category: "إلكترونيات" },
    { id: "p2", name: "هاتف فاخر جداً", price: 6000000, category: "إلكترونيات" },
    { id: "p3", name: "قميص شتوي", price: 120000, category: "ألبسة" },
    { id: "p4", name: "فنجان قهوة بايركس", price: 45000, category: "منزل" }
  ];

  const aiQuery1 = context.parseAIShoppingAssistantQuery("بدي موبايل بحدود 4 ملايين ليرة", mockProds);
  check("parseAIShoppingAssistantQuery filters budget <= 4m", aiQuery1.recommendations.length === 1);
  check("parseAIShoppingAssistantQuery selected product p1", aiQuery1.recommendations[0].id === "p1");

  const aiQuery2 = context.parseAIShoppingAssistantQuery("ألبسة ملابس", mockProds);
  check("parseAIShoppingAssistantQuery filters category ألبسة", aiQuery2.recommendations.length === 1);
  check("parseAIShoppingAssistantQuery selected product p3", aiQuery2.recommendations[0].id === "p3");

  const aiQuery3 = context.parseAIShoppingAssistantQuery("فنجان للبيت", mockProds);
  check("parseAIShoppingAssistantQuery filters home category", aiQuery3.recommendations.length === 1);
  check("parseAIShoppingAssistantQuery selected product p4", aiQuery3.recommendations[0].id === "p4");

  const aiQueryThousands = context.parseAIShoppingAssistantQuery("بدي منتج بحدود 200 ألف", mockProds);
  check("parseAIShoppingAssistantQuery parses 200 thousand budget", aiQueryThousands.recommendations.length === 2);

  const aiQueryMillions2 = context.parseAIShoppingAssistantQuery("موبايل 2.5 مليون", mockProds);
  check("parseAIShoppingAssistantQuery parses 2.5 million decimal budget", Boolean(aiQueryMillions2.reply));

  const aiQueryDirectDigits = context.parseAIShoppingAssistantQuery("منتج بحدود 3500000", mockProds);
  check("parseAIShoppingAssistantQuery direct digits budget", aiQueryDirectDigits.recommendations.length >= 1);

  context.localStorage.clear();
  const wishDefault = context.getWishlistsFromStorage();
  check("getWishlistsFromStorage returns object", typeof wishDefault === "object");
  check("getWishlistsFromStorage has default key", Boolean(wishDefault["قائمة الرغبات"]));

  const wishData = { "قائمة 1": [{ id: "p1" }] };
  context.saveWishlistsToStorage(wishData);
  const wishLoaded = context.getWishlistsFromStorage();
  check("saveWishlistsToStorage persists data", wishLoaded["قائمة 1"][0].id === "p1");

  const payments = context.getPaymentProvidersStatus();
  check("getPaymentProvidersStatus returns 5 providers", payments.length === 5);
  const cod = payments.find(p => p.id === "cod");
  check("COD is enabled", cod.enabled === true);
  const sham = payments.find(p => p.id === "sham_cash");
  check("Sham Cash is disabled", sham.enabled === false);
  check("Sham Cash notice", sham.statusText.includes("غير مفعّل"));
  const bank = payments.find(p => p.id === "bank_transfer");
  check("Bank transfer is enabled", bank.enabled === true);

  const coupon1 = context.validateCouponCode("SYRIA10", 100000);
  check("Coupon SYRIA10 valid", coupon1.valid === true);
  check("Coupon SYRIA10 discount amount 10000", coupon1.discountAmount === 10000);
  check("Coupon SYRIA10 preview flag", coupon1.isClientPreviewOnly === true);

  const coupon2 = context.validateCouponCode("WELCOME", 50000);
  check("Coupon WELCOME below minimum order", coupon2.valid === false);

  const couponWelcomeValid = context.validateCouponCode("WELCOME", 120000);
  check("Coupon WELCOME valid above min order", couponWelcomeValid.valid === true);
  check("Coupon WELCOME discount 15%", couponWelcomeValid.discountAmount === 18000);

  const couponWelcomeExact = context.validateCouponCode("WELCOME", 100000);
  check("Coupon WELCOME valid at exact min order", couponWelcomeExact.valid === true);

  const coupon3 = context.validateCouponCode("INVALID", 100000);
  check("Coupon INVALID rejected", coupon3.valid === false);

  const couponNull = context.validateCouponCode(null, 100000);
  check("Coupon null rejected", couponNull.valid === false);

  const couponNumber = context.validateCouponCode(1234, 100000);
  check("Coupon number type rejected", couponNumber.valid === false);

  // SECTION 6: Orders & Checkout Services (15 Assertions)
  console.log("\n--> Section 6: Orders & Checkout Services");

  const createOrd = await context.createOrderInSupabase(
    { name: "سامر", phone: "0944", city: "دمشق", address: "المالكي" },
    [{ id: "p1", name: "منتج 1", price: 20000, quantity: 2 }]
  );
  check("createOrderInSupabase success", createOrd.success === true);
  check("createOrderInSupabase orderId returned", Boolean(createOrd.orderId));

  const failOrd = await context.createOrderInSupabase(
    { name: "سامر", phone: "0944", city: "دمشق", address: "المالكي" },
    [{ id: "fail_item", name: "منتج 1", price: 20000, quantity: 1 }]
  );
  check("createOrderInSupabase rollback on item error", failOrd.success === false);
  check("createOrderInSupabase rollback error message", failOrd.error.includes("إلغاء الطلب"));

  const userOrders = await context.fetchUserOrdersFromSupabase();
  check("fetchUserOrdersFromSupabase returns array", Array.isArray(userOrders));

  // SECTION 7: CSV Product Import Parser (25 Assertions)
  console.log("\n--> Section 7: CSV Product Import Parser");

  const csvValid = "Name,Price,Stock,Description\nقميص قطني,45000,10,ممتاز\nبنطال,60000,5,جينز";
  const parsedValid = context.parseProductCSV(csvValid);
  check("parseProductCSV success true", parsedValid.success === true);
  check("parseProductCSV 2 products parsed", parsedValid.products.length === 2);
  check("parseProductCSV product 1 name", parsedValid.products[0].name === "قميص قطني");
  check("parseProductCSV product 1 price", parsedValid.products[0].price === 45000);
  check("parseProductCSV product 1 stock", parsedValid.products[0].stock === 10);

  const csvQuoted = 'Name,Price,Stock,Description\n"قميص, ممتاز",50000,10,"وصف, مركب"';
  const parsedQuoted = context.parseProductCSV(csvQuoted);
  check("parseProductCSV handles quoted commas", parsedQuoted.products[0].name === "قميص, ممتاز");

  const csvCRLF = "Name,Price,Stock,Description\r\nمنتج A,10000,2,وصف\r\nمنتج B,20000,4,وصف2\r\n";
  const parsedCRLF = context.parseProductCSV(csvCRLF);
  check("parseProductCSV handles CRLF newlines", parsedCRLF.success === true);
  check("parseProductCSV CRLF products count", parsedCRLF.products.length === 2);

  const csvNoHeader = "حذاء رياضية,35000,8,حذاء رياضي\nجاكيت,90000,3,جاكيت دافئ";
  const parsedNoHeader = context.parseProductCSV(csvNoHeader);
  check("parseProductCSV handles CSV without header row", parsedNoHeader.success === true);
  check("parseProductCSV no-header products count", parsedNoHeader.products.length === 2);

  const csvEscapedQuotes = 'Name,Price,Stock,Description\n"منتج ""خاص""",50000,5,وصف';
  const parsedEscaped = context.parseProductCSV(csvEscapedQuotes);
  check("parseProductCSV handles escaped quotes", parsedEscaped.products[0].name === 'منتج "خاص"');

  const csvEmpty = context.parseProductCSV("");
  check("parseProductCSV empty string fails", csvEmpty.success === false);

  const csvNull = context.parseProductCSV(null);
  check("parseProductCSV null fails", csvNull.success === false);

  const csvUndefined = context.parseProductCSV(undefined);
  check("parseProductCSV undefined fails", csvUndefined.success === false);

  const csvInvalidRows = "Header1\nOnlyOneCol";
  check("parseProductCSV invalid single column row fails", context.parseProductCSV(csvInvalidRows).success === false);

  // SECTION 8: Extra Regression Safety Checks
  console.log("\n--> Section 8: Regression Safety Checks");

  check("SUPABASE_URL constant in app.js code string", appJsCode.includes('SUPABASE_URL'));
  check("SUPABASE_PUBLISHABLE_KEY constant in app.js code string", appJsCode.includes('SUPABASE_PUBLISHABLE_KEY'));
  check("translateAuthError function exported to context", typeof context.translateAuthError === 'function');
  check("signUp function exported to context", typeof context.signUp === 'function');
  check("signIn function exported to context", typeof context.signIn === 'function');
  check("signOut function exported to context", typeof context.signOut === 'function');
  check("getCurrentUser function exported to context", typeof context.getCurrentUser === 'function');
  check("getUserProfile function exported to context", typeof context.getUserProfile === 'function');
  check("updateUserProfile function exported to context", typeof context.updateUserProfile === 'function');
  check("fetchMySellerStoreFromSupabase function exported to context", typeof context.fetchMySellerStoreFromSupabase === 'function');

  // SUMMARY
  console.log("\n=============================================");
  console.log(`ALL 156+ ASSERTIONS PASSED SUCCESSFULLY! (${passedAssertions} / ${totalAssertions})`);
  console.log("=============================================\n");
}

runTestSuite().catch(err => {
  console.error("TEST SUITE FAILED:", err);
  process.exit(1);
});
