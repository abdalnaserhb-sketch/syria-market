# Syria Market (السوق السوري) - Manual Configuration Guide

This document outlines the recommended manual configurations in the Supabase Dashboard to complete the Syria Market brand identity and authentication experience for customers.

---

## 1. Supabase Authentication & Branding Settings

To ensure customer-facing emails (Confirmation, Password Reset, Magic Links) reflect **Syria Market / السوق السوري** instead of default Supabase branding:

1. **Sender Name & Email**:
   - Go to **Supabase Dashboard** -> **Authentication** -> **Email Templates**.
   - Set **Sender Name** to `السوق السوري | Syria Market`.
   - Set **Sender Email** to your custom domain address (e.g., `no-reply@syriamarket.com` or custom SMTP email).

2. **Custom SMTP Configuration**:
   - Go to **Supabase Dashboard** -> **Project Settings** -> **Authentication** -> **SMTP Settings**.
   - Enable **Custom SMTP**.
   - Configure Host, Port, Username, and Password for your transactional email provider (e.g. Resend, SendGrid, Amazon SES, or custom mail server).

3. **Email Templates (Arabic & Syria Market Branding)**:
   - **Confirm Signup Template**:
     - Subject: `تأكيد تسجيل الحساب في السوق السوري 🇸🇾`
     - Body: Custom HTML with Syria Market logo, welcome text in Arabic, and `{{ .ConfirmationURL }}` redirecting back to your domain.
   - **Reset Password Template**:
     - Subject: `إعادة تعيين كلمة المرور - السوق السوري`
     - Body: Custom HTML with Arabic instructions and `{{ .ConfirmationURL }}` redirecting to `https://<your-domain>/#type=recovery`.

4. **URL Configuration**:
   - Go to **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
   - Set **Site URL** to your live marketplace URL (e.g., `https://syriamarket.com`).
   - Add Redirect URLs: `https://syriamarket.com/*` or `http://localhost:*` for local testing.

---

## 2. RLS & Admin Management (Future Expansion)

- All existing RLS policies on `products`, `orders`, `order_items`, `sellers`, and `profiles` remain active and unchanged.
- Future Admin portal management can build upon the `profiles.role` field (`admin`, `seller`, `customer`) without modifying table schemas.
