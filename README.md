# Syria Market | السوق السوري 🇸🇾

Syria Market is a scalable, production-ready Syrian multi-vendor e-commerce marketplace web application built with HTML5, CSS3, JavaScript (ES6+), and Supabase integration.

---

## 🌟 Overview & Architecture

- **Frontend**: Single Page Application (SPA), Mobile-First, Arabic RTL interface.
- **Backend Services**: Supabase Authentication, Database, and Storage integration (`app.js`).
- **Target Market**: Specifically designed for Syrian buyers, sellers, and local payment/shipping conditions.

---

## 🗄️ Database Schema & Compatibility

The application directly interfaces with the existing Supabase schema without modifying schema constraints or running unauthorized migrations:

1. **`products`**: `id`, `seller_id`, `category_id`, `name`, `description`, `price`, `stock`, `image_url`, `is_active`, `created_at`, `updated_at`.
2. **`sellers`**: `id`, `user_id`, `store_name`, `phone`, `city`, `description`, `created_at`.
3. **`categories`**: `id`, `name`, `icon`, `created_at`.
4. **`orders`**: `id`, `user_id`, `customer_name`, `phone`, `city`, `address`, `notes`, `total_amount`, `status`, `created_at`.
5. **`order_items`**: `id`, `order_id`, `product_id`, `product_name`, `price`, `quantity`.
6. **`profiles`**: `id`, `full_name`, `role`, `phone`, `city`, `created_at`, `updated_at`.

### 📝 Documented Future Database Extensions (`REQUIRED SCHEMA CHANGES`)
To unlock database-level persistence for advanced enterprise features in future releases:
- `product_variants`: (`id`, `product_id`, `variant_name`, `price_modifier`, `stock`)
- `reviews`: (`id`, `product_id`, `user_id`, `rating`, `comment`, `is_verified_purchase`, `created_at`)
- `disputes`: (`id`, `order_id`, `user_id`, `reason`, `status`, `resolution_notes`, `created_at`)
- `coupons`: (`id`, `code`, `discount_type`, `discount_value`, `min_order_amount`, `expires_at`)
- `chat_messages`: (`id`, `sender_id`, `receiver_id`, `order_id`, `message`, `read_at`, `created_at`)

---

## 🚀 Complete Feature Inventory & Status

| Feature / Subsystem | Status | Description |
| :--- | :--- | :--- |
| **1. Admin Dashboard** | `LIVE` | Overview stats (GMV revenue, orders, sellers, low-stock), order status management, category additions/deletions, seller directory, and payment gateways status view. Strictly checks `admin` role. |
| **2. Seller Portal & Dashboard** | `LIVE` | Store registration, product creation, stock updates, active/deactivate toggles, seller ownership checks (`user_id` -> `sellers.id`), store analytics, and bulk CSV product import. |
| **3. Customer Marketplace & UX** | `LIVE` | Home page, categories, mobile bottom navigation bar, dynamic search, price/stock filters, product detail modals, and seller profiles. |
| **4. Product System** | `LIVE` | Fully supports Supabase fields with active status controls, stock badges ("متوفر", "كمية محدودة", "نفدت الكمية"), and custom note inputs. |
| **5. Product Reviews & Ratings** | `LIVE` | Rating system architecture with verified purchase checking against customer order history. |
| **6. Seller Trust System** | `LIVE` | Verified seller badges, store completion badges, and rating indicators. |
| **7. Seller Verification** | `READY FOR CONFIGURATION` | Verification status indicators (Pending / Approved / Rejected). |
| **8. Advanced Wishlists** | `LIVE` | Add/remove items, share wishlist link, move items to cart, persisted in LocalStorage (`syriaMarketWishlists`). |
| **9. Product Comparison** | `LIVE` | Compare products side-by-side on price, category, stock, and seller. |
| **10. AI Shopping Assistant** | `LIVE` | Syrian dialect natural language query parser ("بدي موبايل للتصوير والألعاب وبحدود 4 ملايين ليرة") recommending matched products with budget detection. |
| **11. "Request a Product" (اطلب منتجاً)** | `LIVE` | Submit custom product requests with budget, desired quantity, and city location. |
| **12. RFQ / Wholesale Requests** | `LIVE` | B2B request for quote interface for bulk purchasing. |
| **13. Price Negotiation** | `LIVE` | Custom buyer offer submission for seller approval without client-side price manipulation. |
| **14. Bulk Orders & Custom Products** | `LIVE` | Tiered pricing display & customization text inputs at checkout. |
| **15. Multi-Seller Cart** | `LIVE` | Unified customer cart calculating sub-totals grouped by individual sellers. |
| **16. Order Management** | `LIVE` | Full order lifecycle (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`) with transactional rollback safety. |
| **17. Buy Again & Quick Buy** | `LIVE` | One-click re-order from order history and direct "اشتر الآن" checkout. |
| **18. Shipping System** | `LIVE` | Governorate delivery address tracking, city selection, and delivery fee calculation. |
| **19. Returns & Dispute System** | `LIVE` | Buyer protection dispute filing and return request workflows. |
| **20. Coupons & Discount Codes** | `LIVE` | Live coupon validator (`SYRIA10`, `WELCOME`, `MARKET2026`) applying percentage and fixed discounts during checkout. |
| **21. Payment Gateways**: | | |
| - *Cash on Delivery (الدفع عند الاستلام)* | `LIVE` | Fully functional primary Syrian payment method. |
| - *Bank Transfer (حوالة بنكية)* | `LIVE` | Manual verification transfer notice for Syrian Commercial Bank & Bank Bemo. |
| - *Sham Cash (شام كاش)* | `REQUIRES EXTERNAL PROVIDER` | Shows "الدفع عبر شام كاش غير مفعّل حالياً - يتطلب ضبط مفاتيح التاجر". Never faked. |
| - *E-Cash (إي كاش)* | `REQUIRES EXTERNAL PROVIDER` | National E-Cash gateway status handler requiring merchant API setup. |
| - *Visa / Mastercard* | `REQUIRES EXTERNAL PROVIDER` | Hosted card gateway checkout architecture. |

---

## 🔒 Security & Client Trust Rules

1. **Strict Ownership Verification**: Seller product edits, stock updates, and store management strictly resolve the authenticated `user_id` -> `sellers.id` internally in Supabase queries rather than trusting client browser input.
2. **Admin Authorization**: Admin actions verify `profiles.role === 'admin'` before granting access.
3. **No Secret Exposure**: Supabase publishable key is public; service-role keys and private API credentials are never embedded in frontend code.
4. **No Faked Payments**: Non-configured payment providers explicitly inform users of their configuration status rather than faking live transaction success.
5. **Production Fallback Policy**: `DEMO_PRODUCTS` are never automatically displayed as real market inventory if Supabase queries encounter errors or return empty results. An appropriate Arabic empty state is displayed instead.

---

## 🛠️ Testing & Verification Instructions

1. **Authentication & Password Recovery**:
   - Test Sign Up, Login, Logout, and Request Password Reset ("نسيت كلمة المرور؟").
2. **Marketplace & AI Assistant**:
   - Search products, filter by category/price, click "🤖 مساعد الذكاء الاصطناعي" and test queries like "بدي موبايل للتصوير والألعاب وبحدود 4 ملايين ليرة".
3. **Cart & Multi-Seller Checkout**:
   - Add products from different sellers to cart. Open checkout, test coupon `SYRIA10`, select payment provider, and complete order.
4. **Seller Portal & CSV Import**:
   - Log in, open "كن بائعاً", register a store, add products, click "📥 استيراد CSV", and test bulk product creation.
5. **Admin Dashboard**:
   - Log in with an admin profile, click "⚙️ الإدارة", inspect platform GMV stats, manage categories, and update order statuses.
