# Memed Backend API

A modular Express.js backend for the MemedLens application that interacts with the Lens Protocol API.

## Project Structure

The backend follows a modular architecture with the following structure:

```
backend/
├── app.js                  # Main application entry point
├── package.json            # Project dependencies and scripts
├── .env                    # Environment variables (create this file)
└── src/
    ├── config/             # Configuration files
    │   └── lens.js         # Lens client configuration
    ├── controllers/        # Request handlers
    │   └── lensController.js # Lens-related controllers
    ├── middleware/         # Express middleware
    │   └── errorHandler.js # Global error handling middleware
    ├── routes/             # API routes
    │   ├── index.js        # Main router that consolidates all routes
    │   └── lensRoutes.js   # Lens-specific routes
    └── services/           # Business logic
        └── lensService.js  # Lens API interaction services
```

## API Endpoints

- `GET /` - Welcome message
- `GET /api/followers/:handle` - Get follower statistics for a Lens handle

## Setup and Running

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with your environment variables (if needed).

3. Start the development server:
   ```
   npm run dev
   ```

4. For production:
   ```
   npm start
   ```

The server runs on port 3000 by default or the port specified in the `.env` file. 