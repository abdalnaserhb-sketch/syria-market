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
