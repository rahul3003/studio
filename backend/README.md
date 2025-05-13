# Backend Application

This is the backend part of the application built with Express.js and Prisma.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the variables as needed

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Run the development server:
```bash
npm run dev
```

The server will start on http://localhost:5000

## Features

- Express.js for the server
- Prisma for database management
- RESTful API endpoints
- CORS enabled
- Environment variable configuration

## Project Structure

- `/src` - Source code
- `/prisma` - Database schema and migrations
- `/routes` - API routes
- `/controllers` - Route controllers
- `/middleware` - Custom middleware 