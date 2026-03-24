# Handcrafted Haven — API Contract (v1)

This document describes the API endpoints for the Handcrafted Haven project.

## Base URLs
- Local: `http://localhost:3000`
- Production (Vercel): `https://handcrafted-haven-blush.vercel.app`

## Response format
- Success responses return JSON objects.
- Error responses return:
```json
{ "error": "message" }
```

## Content Type
For POST/PUT requests, use:
- `Content-Type: application/json`

## Environment Variables (Backend)
Required:
- `MONGODB_URI` (MongoDB Atlas connection string recommended)
- `JWT_SECRET` (used to sign/verify JWT tokens)

---

# Authentication (JWT)

## Authorization header
Protected endpoints require:
```
Authorization: Bearer <token>
```

### JWT payload (decoded)
The backend expects tokens that decode to:
```json
{
  "userId": "string",
  "email": "string",
  "role": "user|seller"
}
```

> Note: Some endpoints in this project already require a token, even if your team is still finishing the login/register routes.

---

# Auth Endpoints (planned / recommended)
These are recommended so the frontend can obtain a JWT token properly.

## Register
POST `/api/auth/register`

Body:
```json
{
  "email": "seller@example.com",
  "password": "Password123!",
  "name": "Seller Name",
  "role": "seller"
}
```

Success (201):
```json
{
  "token": "<jwt>",
  "user": { "id": "...", "email": "...", "name": "...", "role": "seller" }
}
```

Errors:
- 400 Missing fields / invalid input
- 409 Email already in use

## Login
POST `/api/auth/login`

Body:
```json
{
  "email": "seller@example.com",
  "password": "Password123!"
}
```

Success (200):
```json
{
  "token": "<jwt>",
  "user": { "id": "...", "email": "...", "name": "...", "role": "seller" }
}
```

Errors:
- 400 Missing fields
- 401 Invalid email/password

---

# Products

## Product object (typical fields)
```json
{
  "_id": "ObjectId",
  "sellerId": "ObjectId OR { _id, name, bio, story }",
  "name": "string",
  "description": "string",
  "price": 25,
  "category": "jewelry|clothing|home-decor|art|other",
  "images": ["https://..."],
  "inStock": true,
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

---

## 1) List products (with filters + pagination)
GET `/api/products`

Query params (optional):
- `category` (string)
- `minPrice` (number)
- `maxPrice` (number)
- `page` (number, default 1)
- `limit` (number, default 10)

Example:
`/api/products?category=jewelry&minPrice=10&maxPrice=50&page=1&limit=10`

Success (200):
```json
{
  "products": [
    {
      "_id": "...",
      "sellerId": { "_id": "...", "name": "Seller Name" },
      "name": "Handmade item",
      "description": "Product description",
      "price": 25,
      "category": "jewelry",
      "images": ["https://..."],
      "inStock": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

Errors:
- 500 Internal server error

---

## 2) Get product detail
GET `/api/products/:id`

Success (200): returns product object  
Note: `sellerId` is populated with `name, bio, story` in this endpoint.

Example Success (200):
```json
{
  "_id": "...",
  "sellerId": { "_id": "...", "name": "Seller Name", "bio": "short bio", "story": "story text" },
  "name": "Handmade item",
  "description": "Product description",
  "price": 25,
  "category": "jewelry",
  "images": ["https://..."],
  "inStock": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

Errors:
- 404 Product not found
- 500 Internal server error

---

## 3) Create product (seller only)
POST `/api/products`

Headers:
- Authorization: Bearer `<token>`

Body:
```json
{
  "name": "Handmade item",
  "description": "Product description",
  "price": 25,
  "category": "jewelry",
  "images": ["https://..."],
  "inStock": true
}
```

Success (201): returns created product  
Note: in this endpoint the response may contain `sellerId` as an ObjectId (not populated).

Errors:
- 401 No token provided / Invalid token
- 403 Only sellers can create products
- 400 Missing required fields
- 500 Internal server error

---

## 4) Update product (seller only + ownership)
PUT `/api/products/:id`

Headers:
- Authorization: Bearer `<token>`

Body (any of these fields):
```json
{
  "name": "Updated name",
  "description": "Updated description",
  "price": 30,
  "category": "art",
  "images": ["https://..."],
  "inStock": false
}
```

Success (200): returns updated product (with `sellerId` populated with `name`)

Errors:
- 401 No token provided / Invalid token
- 403 Not authorized to update this product (not owner)
- 404 Product not found
- 400 Invalid price / Invalid category
- 500 Internal server error

---

## 5) Delete product (seller only + ownership)
DELETE `/api/products/:id`

Headers:
- Authorization: Bearer `<token>`

Success (200):
```json
{ "message": "Product deleted successfully" }
```

Errors:
- 401 No token provided / Invalid token
- 403 Not authorized to delete this product (not owner)
- 404 Product not found
- 500 Internal server error

---

# Reviews

## Review object (typical fields)
```json
{
  "_id": "ObjectId",
  "productId": "ObjectId",
  "userId": "ObjectId OR { _id, name }",
  "rating": 1,
  "comment": "string",
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

---

## 1) List reviews for a product
GET `/api/products/:id/reviews`

Success (200):
```json
{
  "reviews": [
    {
      "_id": "...",
      "productId": "...",
      "userId": { "_id": "...", "name": "User Name" },
      "rating": 5,
      "comment": "Great product!",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "stats": {
    "total": 1,
    "average": 5
  }
}
```

Errors:
- 404 Product not found
- 500 Internal server error

---

## 2) Create review (user logged in)
POST `/api/products/:id/reviews`

Headers:
- Authorization: Bearer `<token>`

Body:
```json
{
  "rating": 5,
  "comment": "Great product!"
}
```

Success (201): returns created review (with `userId` populated with `name`)

Errors:
- 401 No token provided / Invalid token
- 404 Product not found
- 400 You have already reviewed this product
- 400 Rating must be a number between 1 and 5
- 400 Comment must be less than 500 characters
- 500 Internal server error