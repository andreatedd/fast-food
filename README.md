# Fast Food Management Platform

A full-stack web application for discovering restaurants, browsing food catalogues, placing orders, and managing restaurant operations. The project was developed as part of the course "Tecnologie e Linguaggi per il Web" of the University of Milan.

## Features

- User registration and login with JWT-based authentication.
- Separate workflows for **customers** and **restaurant owners**.
- Restaurant search and restaurant detail pages.
- Food catalogue browsing, filtering, and personalised restaurant suggestions.
- Shopping cart and order creation for customers.
- Customer order history and profile management.
- Restaurant profile and menu management for restaurant owners.
- Restaurant order management, status updates, and statistics.
- OpenAPI/Swagger documentation for the backend API.
- Optional catalogue seeding from the included `backend/data/meals.json` file.

## Technology stack

- **Backend:** Node.js, Express 5
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT) and bcrypt password hashing
- **Frontend:** HTML5, CSS3, JavaScript, and Bootstrap 5
- **API documentation:** Swagger UI and OpenAPI 3

## Project structure

```text
.
├── backend/
│   ├── data/
│   │   └── meals.json              # Initial food catalogue data
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # MongoDB connection
│   │   ├── middlewares/
│   │   │   └── validations.js      # Request validation and auth checks
│   │   ├── models/                 # Mongoose schemas
│   │   └── routes/                 # REST API route modules
│   ├── app.js                      # Backend entry point
│   ├── setup.js                    # Catalogue seed script
│   ├── swagger.js                  # OpenAPI document generator
│   ├── swagger.json                # Generated API specification
│   ├── .env.example                # Environment variable template
│   └── package.json
├── frontend/
│   ├── auth.html                   # Login and registration
│   ├── homepage.html               # Restaurant search
│   ├── dettaglio_ristorante.html   # Restaurant menu and checkout
│   ├── storico_ordini.html         # Customer order history
│   ├── profilo_utente.html         # User profile
│   ├── crea_ristorante.html        # Restaurant profile setup
│   ├── dashboard.html              # Restaurant menu management
│   └── gestione_ordini.html        # Restaurant order management
└── README.md
```

## Prerequisites

- Node.js 20.19 or later (required by the installed Mongoose version).
- A MongoDB database, either a local MongoDB instance or a MongoDB Atlas cluster.
- A modern web browser.

## Installation

Clone the repository and install the backend dependencies:

```bash
git clone https://github.com/andreatedd/fast-food.git
cd fast-food/backend
npm install
```

Create a `.env` file in the `backend` directory from the provided template:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Set the variables in `backend/.env`.

## Running the application

From the `backend` directory, start the API server:

```bash
node app.js
```

The backend is available at [http://localhost:3000](http://localhost:3000), unless a different `PORT` is configured.

To populate or replace the food catalogue with the data in `backend/data/meals.json`, run:

```bash
node setup.js
```

The seed script deletes the existing catalogue entries before inserting the JSON data, so use it only when replacing the current catalogue is intended.

Open `frontend/auth.html` in a browser to register or log in. After authentication, the frontend stores the JWT and uses the backend at `http://localhost:3000`.

## API documentation

With the backend running, open the interactive Swagger UI at:

[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

The main API areas are:

| Area | Base path | Purpose |
| --- | --- | --- |
| Authentication | `/api/auth` | Registration and login |
| Restaurants | `/api/ristoranti` | Restaurant listing, search, details, and recommendations |
| Users | `/api/utenti` | Authenticated user profile management |
| Restaurant owners | `/api/ristoratore` | Restaurant profile and menu management |
| Catalogue | `/api/catalogo` | Food catalogue and categories |
| Orders | `/api/ordini` | Customer orders and restaurant order management |

Protected endpoints require the JWT returned by `/api/auth/login` in the request header:

```text
Authorization: Bearer <token>
```

## Generating the Swagger specification

If the API routes change, regenerate `backend/swagger.json` from the `backend` directory:

```bash
node swagger.js
```

## User roles

- **Customer (`cliente`):** browse restaurants, receive recommendations, manage a profile, place orders, and view order history.
- **Restaurant owner (`ristoratore`):** configure a restaurant, manage its menu, view incoming orders, update order statuses, and inspect statistics.

## Academic project

This repository contains the implementation for the course final project. No production deployment, payment processing, or hosting service is included.
