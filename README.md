# WRS — Water Refilling Station System

A full-featured management system built for a local water refilling station business. Designed to be fully dynamic — all business rules are configurable from the admin panel without touching code.

## Tech Stack

- **Laravel 13** + **PHP 8.3**
- **MySQL 8** (Laragon local setup)
- **React 18** + **Inertia.js v1** (no separate API layer)
- **MUI v5** — component library
- **Vite 8** — build tool
- **Spatie Laravel Permission** — roles & permissions
- **Laravel Breeze** — authentication scaffolding

## Features

- **POS / Orders** — walk-in and delivery orders, supports mixed product types (refill, new container, accessories, bundles)
- **Credit / Utang System** — per-customer credit limits, partial payments, credit transaction history, write-offs
- **Products** — fully dynamic product catalog with pricing rules (bulk, suki, time-limited)
- **Inventory** — stock tracking, stock alerts, supplier management
- **Delivery** — zone & slot management, rider assignment, status tracking
- **Expenses** — categorized expense logging with receipt photo support
- **Reports & Dashboard** — sales, profit, delivery analytics
- **Settings** — all business rules configurable via admin panel (no hardcoded values)

## Roles

| Role | Access |
|------|--------|
| `admin` | Full access |
| `manager` | Ops & reports, no user/role management |
| `cashier` | POS counter only |
| `customer` | Read-only own data |

## Local Setup

**Requirements:** PHP 8.3, Composer, Node.js, MySQL 8, Laragon

```bash
# Clone and install dependencies
composer install
npm install --legacy-peer-deps

# Environment setup
cp .env.example .env
php artisan key:generate

# Configure your database in .env, then:
php artisan migrate --seed

# Start the dev server
npm run dev
php artisan serve
```

**Default admin credentials:**
- Email: `admin@wrs.com`
- Password: `password`

## Database

22 tables covering: users, customers, products, orders, payments, deliveries, inventory, expenses, and system settings.

All money columns use `decimal(10, 2)`. Soft deletes on customers, products, orders, deliveries, expenses, and suppliers. Every create/update/delete/void action is audit logged.

## Key Settings (configured via admin panel)

| Key | Description |
|-----|-------------|
| `new_gallon_free_refill` | Buying a new container can include a free refill |
| `default_credit_limit` | System-wide default credit limit per customer |
| `allow_partial_payment` | Customers can pay any amount toward their balance |
| `over_limit_behavior` | Warn or block when customer hits credit limit |
| `delivery_enabled` | Toggle delivery feature on/off |
| `allow_discount` | Toggle discounts on/off |

## License

Private project — all rights reserved.
