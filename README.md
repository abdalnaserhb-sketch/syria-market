# Syria Market | السوق السوري 🇸🇾

Syria Market is a polished, production-ready Syrian multi-vendor e-commerce marketplace web application built with HTML5, CSS3, JavaScript (ES6+), and Supabase.

## Overview & Architecture
- **Frontend Architecture**: Pure vanilla Single Page Application (SPA), RTL, Arabic-first design.
- **Backend Services**: Supabase Authentication, Database, and Storage integration (`app.js`).
- **Database Schema**:
  - `products`: Includes `id`, `seller_id`, `category_id`, `name`, `description`, `price`, `stock`, `image_url`, `is_active`, `created_at`, `updated_at`.
  - `sellers`: Includes `id`, `user_id`, `store_name`, `phone`, `city`, `description`, `created_at`.
  - `categories`: Includes `id`, `name`, `icon`, `created_at`.
  - `orders`: Includes `id`, `user_id`, `customer_name`, `phone`, `city`, `address`, `notes`, `total_amount`, `status`, `created_at`.
  - `order_items`: Includes `id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`.
  - `profiles`: Includes `id`, `full_name`, `role`, `phone`, `city`, `created_at`, `updated_at`.

## Core Features
1. **Authentication & Password Recovery**:
   - Customer & Seller Sign Up, Sign In, Sign Out.
   - Password reset via email (`requestPasswordReset`) and token-based password recovery modal.
   - Arabic translations for Supabase authentication errors.
2. **Customer Account & Profiles**:
   - Profile management (Full Name, Phone, City).
   - Order history tracking with itemized order details.
3. **Product Catalog & Details**:
   - Dynamic product listing with search and category filtering.
   - Product Details Modal showing full description, seller info, category, and stock status.
   - Stock indicators ("متوفر", "كمية محدودة", "نفدت الكمية").
4. **Cart & Safe Checkout**:
   - Persistent cart in `localStorage`.
   - Quantity adjustment and stock threshold validation.
   - Transactional checkout: If saving `order_items` fails, the order is automatically rolled back (deleted) to prevent orphan order records.
5. **Seller Portal**:
   - Store registration mapped to Supabase `sellers` table using authenticated `user_id`.
   - Seller dashboard: Product creation with stock & category selection, product activation/deactivation toggles, and live stock adjustments.
6. **Syria Market Identity**:
   - Clean, customer-facing Arabic interface avoiding third-party default branding.

## Supabase Required Manual Configuration (Production Setup)
To finalize custom branding for authentication emails sent by Supabase:
1. **Custom Domain & Redirect URLs**:
   - Set Site URL in Supabase Dashboard -> Authentication -> URL Configuration to `https://<your-domain>.com`.
   - Add `https://<your-domain>.com/*` to Redirect URLs.
2. **Custom SMTP / Email Sender**:
   - Configure Custom SMTP in Supabase Settings -> Auth -> Email Templates / SMTP.
   - Set Sender Name to `Syria Market | السوق السوري` and Sender Email to `noreply@<your-domain>.com`.
3. **Email Templates**:
   - Customize Sign Up Confirmation & Password Reset HTML templates to feature Syria Market logo and branding.