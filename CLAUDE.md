# WRS — Water Refilling Station System

## Project overview
A full-featured water refilling station management system built for a real local business. The goal is to be as dynamic and flexible as possible — no hardcoded business rules. Everything the owner needs to change day-to-day is configurable from the admin panel without touching code.

## Tech stack
- **Laravel 13** — PHP framework
- **PHP 8.3** — server-side language
- **MySQL 8** — database (Laragon local setup)
- **Spatie Laravel Permission** — roles & permissions
- **Laravel Breeze** — authentication scaffolding
- **React 18** — UI library
- **Inertia.js v1** — bridges Laravel + React (no separate API)
- **MUI v6** — component library (Grid uses `size={{ xs, sm }}` syntax, not `item xs={} sm={}`)
- **MUI v5** is listed in package.json but the installed version behaves as v6 — always use v6 Grid syntax
- **Vite 8** — build tool (installed with --legacy-peer-deps)

## Project location
`C:\laragon\www\wrs`

## Roles (Spatie)
- `admin` — full access to everything
- `manager` — ops, reports, no user/role management
- `cashier` — POS counter only
- `customer` — read only their own data (via policy)

## Admin user (seeded)
- Email: admin@wrs.com
- Password: password

## Key business rules (all dynamic via settings table)
- `new_gallon_free_refill` — buying a new container can include a free refill, toggled per product via `includes_free_refill` on the products table
- `default_credit_limit` — system-wide default credit limit per customer
- `allow_partial_payment` — customers can pay any amount toward their balance
- `over_limit_behavior` — warn or block when customer hits credit limit
- `delivery_enabled` — toggle delivery feature on/off
- `allow_discount` — toggle discounts on/off
- All settings are key-value rows in the `settings` table, not hardcoded

## Products (fully dynamic)
Admin creates any product from the panel. No hardcoded product types.
- `type`: refill, container, accessory, bundle
- `size`: 500ml, 1L, 5gal, etc. (free text)
- `unit`: gallon, bottle, piece, sachet
- `includes_free_refill`: buying this container includes a free refill
- `track_stock`: whether to decrement stock on sale
- `is_bundle`: links to bundle_items table
- Pricing rules in `product_pricing` table (bulk, suki, time-limited)

## Order flow
1. Cashier opens POS, selects customer (optional for walk-in)
2. Adds products (refill, new gallon, cover, any mix)
3. System checks: free refill setting, stock availability, pricing rules
4. Order confirmed with line items snapshotting unit_price and capital_cost
5. Payment collected — supports split payments (cash + GCash etc.)
6. Walk-in: fulfilled at counter. Delivery: assigned to rider
7. Post-sale: inventory decremented, customer balance updated, reports updated

## Credit / utang system
- Per-customer credit limit (overrides system default)
- Every credit movement logged in `credit_transactions`
- Types: charge, payment, partial, writeoff, adjustment
- Partial payments supported
- Pay on delivery supported
- Admin can manually settle or write off any balance

## Expenses
- Categories managed by admin (not hardcoded)
- Types: fixed (rent, salary), variable (electricity, water), one-time (repairs)
- Every expense logged with who entered it and date
- Receipt photo upload supported
- Net profit = Total Sales − Cost of Goods − Total Expenses

## Delivery
- Zones managed by admin (name, fee, minimum order)
- Slots managed by admin (Morning, Afternoon etc.)
- Rider assigned per delivery
- Status: pending, assigned, in_transit, delivered, failed
- Delivery fee snapshotted on the order

## Database — 22 tables
### Auth & users
- `users` (+ is_active, last_login_at)
- `roles`, `permissions` (Spatie managed)

### Customers
- `customers` (credit_limit, outstanding_balance, type, delivery_zone_id)
- `credit_transactions` (charge/payment/writeoff/adjustment)

### Products & pricing
- `products` (type, size, unit, capital_cost, selling_price, includes_free_refill, is_bundle)
- `bundle_items` (bundle_id, product_id, quantity, override_price)
- `product_pricing` (customer_type, min_qty, price, starts_at, ends_at)

### Orders & payments
- `orders` (type, status, subtotal, discount, delivery_fee, total, payment_status)
- `order_items` (snapshots product_name, unit_price, capital_cost at time of sale)
- `order_payments` (supports multiple payments per order, reference_no for GCash/Maya)

### Delivery
- `deliveries` (rider_id, zone_id, slot_id, status, fee, address snapshot)
- `delivery_zones` (name, fee, min_order)
- `delivery_slots` (label, start_time, end_time)

### Inventory & suppliers
- `stock_logs` (type: in/out/adjustment, stock_before, stock_after, capital_cost snapshot)
- `stock_alerts` (min_qty, notify_roles as JSON)
- `suppliers` (name, phone, email, contact_person)

### Expenses
- `expense_categories` (name, type: fixed/variable/one-time)
- `expenses` (amount, date, receipt_photo, logged_by)

### System
- `settings` (key, value, type, group) — all business rules stored here
- `payment_methods` (name, code, is_active, sort_order) — admin managed
- `audit_logs` (user_id, action, model, model_id, old_values, new_values)

## Seeded defaults
- Roles: admin, manager, cashier, customer
- Permissions: ~35 granular permissions across all modules
- Payment methods: Cash, GCash, Maya, Bank Transfer, Credit
- Expense categories: Labor/wages, Electricity, Water source, Filter replacement, Rent, Miscellaneous
- Settings: shop_name, credit defaults, delivery defaults, inventory thresholds

## Models to build (19 total)
All in `app/Models/`:
- `User` — update with HasRoles, is_active, last_login_at
- `Customer` — hasMany orders, creditTransactions. hasAvailableCredit() helper
- `Product` — hasMany bundleItems, pricing, stockLogs. profit and profitMargin accessors
- `BundleItem` — belongsTo Product (bundle), belongsTo Product (product)
- `ProductPricing` — belongsTo Product
- `Order` — hasMany items, payments, creditTransactions. hasOne delivery. grossProfit accessor
- `OrderItem` — snapshots product_name, unit_price, capital_cost. profit accessor
- `OrderPayment` — belongsTo Order, PaymentMethod
- `Delivery` — belongsTo Order, User (rider), DeliveryZone, DeliverySlot
- `DeliveryZone` — hasMany customers, deliveries
- `DeliverySlot` — hasMany deliveries
- `StockLog` — belongsTo Product, Supplier, User (logged_by), Order
- `StockAlert` — belongsTo Product. notify_roles cast as array
- `Supplier` — hasMany stockLogs
- `ExpenseCategory` — hasMany expenses
- `Expense` — belongsTo ExpenseCategory, User (logged_by)
- `PaymentMethod` — hasMany orderPayments
- `Setting` — static get(key, default) and set(key, value) helpers
- `AuditLog` — belongsTo User. old_values/new_values cast as array
- `CreditTransaction` — belongsTo Customer, Order, User (approved_by)

## Build order (step by step)
- [x] Step 1 — Laravel + Breeze + Inertia + React + MUI + Vite scaffold
- [x] Step 2 — Spatie roles & permissions + seeders
- [x] Step 3 — All 22 database migrations (bundle_items migration was missing; added during Step 4)
- [x] Step 4 — All 19 Eloquent models
- [x] Step 5 — Settings module (admin panel — first UI to build)
- [x] Step 6 — Products module (CRUD + pricing rules)
- [x] Step 7 — Customers module (CRUD + credit management)
- [x] Step 8 — Orders module (POS + walk-in)
- [x] Step 9 — Delivery module (rider assignment + tracking)
- [x] Step 10 — Inventory module (stock logs + alerts + suppliers)
- [x] Step 11 — Expenses module
- [x] Step 12 — Reports & dashboard (sales, profit, delivery analytics)
- [x] Step 13 — Staff (Users) module (admin-only CRUD for cashier/manager accounts)
- [x] Step 14 — Role-based sidebar filtering (nav items hidden based on user permissions)

## Coding conventions
- Controllers in `app/Http/Controllers/` grouped by module
- Inertia pages in `resources/js/Pages/` grouped by module
- Use Spatie `can()` middleware on all routes
- Snapshot unit_price and capital_cost on every order_item at time of sale
- Use softDeletes on: customers, products, orders, deliveries, expenses, suppliers
- Settings always read via `Setting::get('key', default)` never hardcoded
- All money columns: `decimal(10, 2)`
- Audit log every create, update, delete, void action
- `ProductPricing` declares explicit `$table = 'product_pricing'` — Laravel would infer `product_pricings` by default
- MUI `@mui/icons-material` installed with `--legacy-peer-deps` (not in original package.json — added during Step 6)
- Grid items use `<Grid size={{ xs: 12, sm: 6 }}>` syntax (MUI v6) — never use `item xs={} sm={}` (MUI v5)
- User permissions are shared globally via `HandleInertiaRequests` as `auth.permissions` (array of permission name strings)
- Sidebar nav items each carry a `permission` key; `AuthenticatedLayout` filters them against `auth.permissions` before rendering — no permission key means always visible (e.g. Dashboard)
- `customer` role is excluded from staff user management — only admin/manager/cashier can be assigned via the Users module