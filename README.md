# Inventory Management API

RESTful API for product inventory and order management with volume, seasonal, and location-based discount rules. Built with Node.js, Express, TypeScript, and CQRS pattern.

## Features

- Product CRUD with stock management (restock/sell operations)
- Order processing with automatic stock updates and discount calculations
- Multi-layered discount system (volume, seasonal, location-based)
- CQRS pattern with separate commands and queries
- Comprehensive testing (66 tests: 45 unit + 21 integration)
- CI/CD pipeline with GitHub Actions

## Quick Start

**Prerequisites**: Node.js >= 20.0.0

```bash
# Install and run
npm install
npm run dev

# Production mode
npm run build
npm start
```

Server runs on `http://localhost:3000` by default.

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
DB_PATH=./db.json
NODE_ENV=development
```

## Testing

```bash
# Run all tests (unit + integration)
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

**Test Results**: 66 tests passing

- 45 unit tests (discount logic, validators)
- 21 integration tests (full API endpoints)

## API Documentation

Base URL: `http://localhost:3000/api`

**Full API Details**: See endpoints below or test with included Postman collection.

### Products

- `POST /api/products` - Create product
- `GET /api/products` - List all products
- `POST /api/products/:id/restock` - Add stock
- `POST /api/products/:id/sell` - Reduce stock

**Example: Create Product**

```json
POST /api/products
{
  "name": "Laptop",
  "description": "High-performance laptop",
  "price": 1499.99,
  "stock": 100,
  "category": "Electronics"
}
```

### Orders

- `POST /api/orders` - Create order with automatic discount calculation
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get specific order

**Example: Create Order**

```json
POST /api/orders
{
  "customerId": "customer-123",
  "location": "Europe",
  "products": [
    { "productId": "abc123", "quantity": 5 }
  ]
}
```

**Response includes**:

- `totalAmount`: Base price
- `discount`: Applied discount percentage (0-30%)
- `finalAmount`: Price after discount and location multiplier

## Discount Rules

| Type         | Rule                      | Effect                   |
| ------------ | ------------------------- | ------------------------ |
| **Volume**   | 5-9 units                 | 10% off                  |
|              | 10-49 units               | 20% off                  |
|              | 50+ units                 | 30% off                  |
| **Seasonal** | Black Friday (Nov 25)     | 25% off all              |
|              | Holiday Sales (Dec 24-26) | 15% off Electronics/Toys |
| **Location** | Europe                    | +15% VAT                 |
|              | Asia                      | -5% logistics            |

**Priority**: Only the best discount applies (no stacking).

**Calculation**: Base price → location adjustment → best discount

## Architecture

**CQRS Pattern**: Commands (`/commands`) for writes, Queries (`/queries`) for reads. See [NOTES.md](./NOTES.md) for detailed architecture decisions.
