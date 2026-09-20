# 📚 BooksCRUD — Full-Stack Book Management System

A full-stack book store application with role-based access control, shopping cart, and order management.

**Backend**: ASP.NET Core 9 Web API · Entity Framework Core 9 · SQL Server  
**Frontend**: React 19 · Vite 8 · Redux Toolkit · React Router v7

---

## Features

### Customer
- Browse & search books with filters (title, author, category, price range, pagination)
- Add/remove books from cart with live quantity controls
- Checkout and place orders
- Track order status with a visual timeline (Pending → Processing → Shipped → Delivered)

### Admin
- Full CRUD on book catalog
- View and manage all customer orders
- Advance order status through the pipeline or cancel orders

---

## Tech Stack

| Layer | Technology |
|---|---|
| API | ASP.NET Core 9, EF Core 9, JWT Bearer Auth |
| Database | SQL Server (LocalDB / full) |
| Password Hashing | BCrypt.Net-Next |
| API Docs | Swashbuckle / Swagger UI |
| Frontend | React 19, Vite 8 |
| State Management | Redux Toolkit |
| HTTP Client | Axios |
| Routing | React Router v7 |

---

## Project Structure

```
BooksCRUD/
├── backend/
│   └── BooksCRUD.API/
│       ├── Controllers/        # Auth, Books, Cart, Orders
│       ├── Data/               # AppDbContext, DbSeeder
│       ├── DTOs/               # Request/Response DTOs
│       ├── Middleware/         # Global exception handler
│       ├── Migrations/         # EF Core migrations
│       ├── Models/             # User, Book, Order, CartItem
│       ├── Repositories/       # Data access layer (interfaces + impl)
│       ├── Services/           # Business logic layer (interfaces + impl)
│       ├── appsettings.example.json  # safe config template (committed)
│       ├── appsettings.json           # your local config (git-ignored)
│       └── Program.cs
└── frontend/
    └── books-client/
        ├── src/
        │   ├── api/            # Axios instance & API calls
        │   ├── components/     # Navbar, BookCard, etc.
        │   ├── pages/          # Home, BookDetails, Cart, Orders
        │   │   └── admin/      # AdminDashboard, AdminOrders, BookForm
        │   └── store/
        │       └── slices/     # auth, books, cart, orders
        ├── index.html
        └── vite.config.js
```

---

## Getting Started

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (or LocalDB)
- [Node.js 20+](https://nodejs.org/)

### 1 — Backend

```bash
cd backend/BooksCRUD.API
```

`appsettings.json` is git-ignored to keep secrets out of version control. Copy the example template and fill in your values:

```bash
cp appsettings.example.json appsettings.json
```

Then edit `appsettings.json`:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=BooksCRUD;Trusted_Connection=True;TrustServerCertificate=True;"
},
"Jwt": {
  "Key": "<your-secret-key-min-32-chars>",
  "Issuer": "BooksCRUD.API",
  "Audience": "BooksCRUD.Client"
}
```

Run the API (migrations and seeding run automatically on startup):

```bash
dotnet run
```

API runs at `http://localhost:5000`  
Swagger UI at `http://localhost:5000/swagger`

### 2 — Frontend

```bash
cd frontend/books-client
npm install
npm run dev
```

App runs at `http://localhost:5173`

---

## Default Seeded Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@bookscrud.com | Admin@123 |
| User | user@bookscrud.com | User@123 |

> The seeder also creates 10 sample books on first run.

---

## API Overview

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Books
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/books` | Paginated list with filters |
| GET | `/api/books/{id}` | Single book |
| POST | `/api/books` | Create book (Admin) |
| PUT | `/api/books/{id}` | Update book (Admin) |
| DELETE | `/api/books/{id}` | Delete book (Admin) |

### Cart
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cart` | Get current user's cart |
| PUT | `/api/cart/{bookId}` | Add / update / remove item |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/orders` | User's own orders |
| GET | `/api/orders/{id}` | Single order |
| POST | `/api/orders/checkout` | Place order from cart |
| GET | `/api/orders/admin/all` | All orders (Admin) |
| PUT | `/api/orders/admin/{id}/status` | Update order status (Admin) |

---

## Order Status Flow

```
Pending → Processing → Shipped → Delivered
    └──────────────────────────→ Cancelled
```

---

## Environment Variables

No `.env` file is required for local development. For production, override these via environment variables or a secrets manager:

| Key | Description |
|---|---|
| `ConnectionStrings__DefaultConnection` | SQL Server connection string |
| `Jwt__Key` | JWT signing secret (min 32 chars) |
| `Jwt__Issuer` | JWT issuer |
| `Jwt__Audience` | JWT audience |

---


