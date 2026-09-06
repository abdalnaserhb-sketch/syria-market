// ============================================
// SYRIA MARKET - SUPABASE
// ============================================

const SUPABASE_URL = "https://ickurcxnyotujnutvfxi.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_jkgJH6Bc__qkrCChS9iFQw_x6D8lhel";


// ============================================
// SUPABASE CLIENT
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

  console.error(
    "Supabase initialization error:",
    error
  );

}


// ============================================
// SIGN UP
// ============================================

async function signUp(
  email,
  password,
  fullName = ""
) {

  if (!supabaseClient) {

    return {
      success: false,
      error: "الاتصال بقاعدة البيانات غير متاح."
    };

  }

  try {

    const { data, error } =
      await supabaseClient.auth.signUp({

        email: email,
        password: password,

        options: {
          data: {
            full_name: fullName
          }
        }

      });


    if (error) {

      console.error(
        "Sign up error:",
        error.message
      );

      return {
        success: false,
        error: error.message
      };

    }


    // إنشاء ملف المستخدم إذا كان الحساب قد أُنشئ
    if (data?.user) {

      try {

        const { error: profileError } =
          await supabaseClient
            .from("profiles")
            .upsert({

              id: data.user.id,
              full_name: fullName,
              role: "customer"

            });


        if (profileError) {

          console.warn(
            "Profile creation warning:",
            profileError.message
          );

        }

      } catch (profileError) {

        console.warn(
          "Profile error:",
          profileError
        );

      }

    }


    return {
      success: true,
      data: data
    };


  } catch (error) {

    console.error(
      "Sign up exception:",
      error
    );

    return {
      success: false,
      error:
        error.message ||
        "حدث خطأ أثناء إنشاء الحساب."
    };

  }

}


// ============================================
// LOGIN
// ============================================

async function signIn(
  email,
  password
) {

  if (!supabaseClient) {

    return {
      success: false,
      error: "الاتصال بقاعدة البيانات غير متاح."
    };

  }

  try {

    const { data, error } =
      await supabaseClient.auth.signInWithPassword({

        email: email,
        password: password

      });


    if (error) {

      console.error(
        "Login error:",
        error.message
      );

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

    console.error(
      "Login exception:",
      error
    );

    return {
      success: false,
      error:
        error.message ||
        "حدث خطأ أثناء تسجيل الدخول."
    };

  }

}


// ============================================
// LOGOUT
// ============================================

async function signOut() {

  if (!supabaseClient) {

    return {
      success: false,
      error: "الاتصال بقاعدة البيانات غير متاح."
    };

  }

  try {

    const { error } =
      await supabaseClient.auth.signOut();


    if (error) {

      console.error(
        "Logout error:",
        error.message
      );

      return {
        success: false,
        error: error.message
      };

    }


    return {
      success: true
    };


  } catch (error) {

    console.error(
      "Logout exception:",
      error
    );

    return {
      success: false,
      error:
        error.message ||
        "حدث خطأ أثناء تسجيل الخروج."
    };

  }

}


// ============================================
// CURRENT USER
// ============================================

async function getCurrentUser() {

  if (!supabaseClient) {
    return null;
  }

  try {

    const { data, error } =
      await supabaseClient.auth.getUser();


    if (error) {
      return null;
    }


    return data?.user || null;


  } catch (error) {

    console.error(
      "Get user error:",
      error
    );

    return null;

  }

}


// ============================================
// AUTH STATE LISTENER
// ============================================

if (supabaseClient) {

  supabaseClient.auth.onAuthStateChange(
    function (event, session) {

      console.log(
        "Syria Market auth:",
        event
      );

      // تحديث واجهة الحساب إذا كانت الدالة موجودة
      if (
        typeof window.updateUserStatus ===
        "function"
      ) {

        window.updateUserStatus();

      }

    }
  );

}
