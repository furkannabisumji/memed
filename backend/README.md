# MemedLens Backend

A modular Node.js backend API for the MemedLens application.

## Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── routes/         # API routes
└── services/       # Business logic
```

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
NODE_ENV=development
```

3. Start the development server:
```bash
pnpm dev
```

## Available Scripts

- `pnpm start` - Start the production server
- `pnpm dev` - Start the development server with hot reload
- `pnpm test` - Run tests (to be implemented)

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint 