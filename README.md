# Syria Market | السوق السوري 🇸🇾

Syria Market is a scalable Syria Market marketplace core with production-ready implemented features and documented architecture for advanced features, built with HTML5, CSS3, JavaScript (ES6+), and Supabase integration.

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
| **1. Admin Dashboard** | `LIVE (UI / RLS DEPENDENT)` | Overview stats (GMV revenue, orders, sellers, low-stock), order status management, category additions/deletions, seller directory, and payment gateways status view. Client-side role checks control UI visibility while authoritative security relies on Supabase RLS. |
| **2. Seller Portal & Dashboard** | `LIVE` | Store registration, product creation, stock updates, active/deactivate toggles, seller ownership checks strictly resolved via `user_id` -> `sellers.id`, store analytics, and RFC-4180 RFC CSV product import. |
| **3. Customer Marketplace & UX** | `LIVE` | Home page, categories, mobile bottom navigation bar, dynamic search, price/stock filters, product detail modals, and seller profiles. |
| **4. Product System** | `LIVE` | Fully supports Supabase fields with active status controls, stock badges ("متوفر", "كمية محدودة", "نفدت الكمية"), and custom note inputs. |
| **5. Product Reviews & Ratings** | `REQUIRED SCHEMA CHANGES` | UI architecture ready; persistent review records require creating a `reviews` table in Supabase. |
| **6. Seller Trust System** | `READY FOR CONFIGURATION` | Verified seller badges, store completion badges, and rating indicators. Persistence requires verification documents schema. |
| **7. Seller Verification** | `READY FOR CONFIGURATION` | Verification status indicators (Pending / Approved / Rejected). |
| **8. Advanced Wishlists** | `LIVE` | Add/remove items, share wishlist link, move items to cart, persisted in LocalStorage (`syriaMarketWishlists`). |
| **9. Product Comparison** | `LIVE` | Compare products side-by-side on price, category, stock, and seller. |
| **10. AI Shopping Assistant** | `RULE-BASED / AI-READY` | Syrian dialect rule-based query parser ("بدي موبايل للتصوير والألعاب وبحدود 4 ملايين ليرة") filtering active marketplace products; LLM API key required for full generative responses. |
| **11. "Request a Product" (اطلب منتجاً)** | `REQUIRED SCHEMA CHANGES` | Form UI ready; saving submitted custom product requests requires adding a `product_requests` table in Supabase. |
| **12. RFQ / Wholesale Requests** | `REQUIRED SCHEMA CHANGES` | B2B quote request UI ready; backend storage requires adding an `rfq_requests` table. |
| **13. Price Negotiation** | `REQUIRED SCHEMA CHANGES` | Offer UI ready; saving counter-offers requires adding an `order_offers` table. |
| **14. Bulk Pricing** | `REQUIRED SCHEMA CHANGES` | Customization instructions input at checkout. Tiered bulk pricing requires adding `bulk_pricing` table for persistence. |
| **15. Multi-Seller Cart** | `CART BREAKDOWN / UI-READY` | Unified customer cart showing seller sub-total breakdown before checkout; seller-specific fulfillment sub-orders require schema support. |
| **16. Order Management** | `LIVE` | Full order lifecycle (`pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`) linked to Supabase `orders` and `order_items`. |
| **17. Buy Again & Quick Buy** | `LIVE` | One-click re-order from order history and direct checkout. |
| **18. Shipping System** | `LIVE` | Governorate delivery address tracking and city selection. |
| **19. Returns & Dispute System** | `REQUIRED SCHEMA CHANGES` | Dispute UI workflow ready; persisting return requests requires adding a `disputes` table. |
| **20. Coupons & Discount Codes** | `CLIENT PREVIEW / REQUIRES SCHEMA` | Client-side UI coupon preview validator (`SYRIA10`, `WELCOME`) applying percentage and fixed discounts during checkout preview. Production order charges require backend coupon validation and a `coupons` table. |
| **21. Payment Gateways**: | | |
| - *Cash on Delivery (الدفع عند الاستلام)* | `LIVE` | Fully functional primary Syrian payment method. |
| - *Bank Transfer (حوالة بنكية)* | `LIVE` | Manual bank transfer with configurable provider/account details and manual verification. |
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
