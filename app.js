// ============================================
// SYRIA MARKET - SUPABASE CONNECTION
// ============================================

const SUPABASE_URL = "https://ickurcxnyotujnutvfxi.supabase.co";


const SUPABASE_PUBLISHABLE_KEY = sb_publishable_jkgJH6Bc__qkrCChS9iFQw_x6D8lhel

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

console.log("Syria Market: Supabase connected");

// ============================================
// AUTHENTICATION
// ============================================

async function signUp(email, password, fullName = "") {
  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password
  });

  if (error) {
    console.error("Sign up error:", error.message);
    return { success: false, error: error.message };
  }

  if (data.user) {
    const { error: profileError } = await supabaseClient
      .from("profiles")
      .insert({
        id: data.user.id,
        full_name: fullName,
        role: "customer"
      });

    if (profileError) {
      console.error("Profile error:", profileError.message);
    }
  }

  return { success: true, data: data };
}

// ============================================
// LOGIN
// ============================================

async function signIn(email, password) {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    console.error("Login error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, data: data };
}

// ============================================
// LOGOUT
// ============================================

async function signOut() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error("Logout error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================
// CURRENT USER
// ============================================

async function getCurrentUser() {
  const { data, error } = await supabaseClient.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}
// ============================================
// SYRIA MARKET - AUTH UI
// ============================================

let authMode = "login";

// فتح نافذة الحساب
function openAuth() {
  const modal = document.getElementById("authModal");

  if (modal) {
    modal.style.display = "flex";
    authMode = "login";
    updateAuthUI();
  }
}

// إغلاق نافذة الحساب
function closeAuth() {
  const modal = document.getElementById("authModal");

  if (modal) {
    modal.style.display = "none";
  }
}

// التبديل بين تسجيل الدخول وإنشاء حساب
function switchAuth() {
  authMode = authMode === "login" ? "signup" : "login";
  updateAuthUI();
}

// تحديث شكل النافذة
function updateAuthUI() {
  const title = document.getElementById("authTitle");
  const submit = document.querySelector(".auth-submit");
  const switchButton = document.querySelector(".auth-switch");
  const fullName = document.getElementById("fullName");
  const message = document.getElementById("authMessage");

  if (authMode === "login") {

    title.textContent = "تسجيل الدخول";
    submit.textContent = "تسجيل الدخول";
    switchButton.textContent = "إنشاء حساب جديد";

    fullName.style.display = "none";

  } else {

    title.textContent = "إنشاء حساب جديد";
    submit.textContent = "إنشاء الحساب";
    switchButton.textContent = "لدي حساب بالفعل";

    fullName.style.display = "block";
  }

  message.textContent = "";
}

// تنفيذ تسجيل الدخول أو التسجيل
async function submitAuth() {

  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value;
  const fullName = document.getElementById("fullName").value.trim();
  const message = document.getElementById("authMessage");

  if (!email || !password) {
    message.textContent = "يرجى إدخال البريد الإلكتروني وكلمة المرور.";
    return;
  }

  message.textContent = "جارٍ المعالجة...";

  // تسجيل الدخول
  if (authMode === "login") {

    const result = await signIn(email, password);

    if (!result.success) {
      message.textContent = result.error;
      return;
    }

    message.textContent = "تم تسجيل الدخول بنجاح.";

    setTimeout(() => {
      closeAuth();
      updateUserStatus();
    }, 800);

  }

  // إنشاء حساب
  else {

    const result = await signUp(email, password, fullName);

    if (!result.success) {
      message.textContent = result.error;
      return;
    }

    message.textContent =
      "تم إنشاء الحساب. تحقق من بريدك الإلكتروني إذا طُلب منك ذلك.";

  }
}

// تحديث حالة الحساب في الواجهة
async function updateUserStatus() {

  const user = await getCurrentUser();
  const status = document.getElementById("userStatus");

  if (!status) return;

  if (user) {
    status.textContent = "حسابي";
  } else {
    status.textContent = "الحساب";
  }
}

// تشغيل تحديث الحساب عند فتح الموقع
document.addEventListener("DOMContentLoaded", () => {
  updateUserStatus();
});
