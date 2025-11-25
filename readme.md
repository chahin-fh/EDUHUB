README file for EDUHUB Project

## Project Overview
EDUHUB is a full-stack web application that connects students with mentors for learning and professional development.

### Tech Stack
**Frontend:**
- Next.js 13+ (React)
- TypeScript
- Tailwind CSS
- Prisma ORM
- Radix UI Components
- Axios for HTTP requests

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account or local MongoDB instance
- npm or pnpm package manager

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. Create `.env.local` file with required variables (see `.env.example`):
   ```bash
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   MONGODB_URI=mongodb+srv://...
   ```

4. Run the development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with required variables (see `.env.example`):
   ```bash
   MONGO_URL=mongodb+srv://...
   JWT_SECRET=your_secret_key
   PORT=5000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

The backend API will be available at `http://localhost:5000`

## Project Structure

### Frontend
- `/app` - Next.js pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions
- `/hooks` - Custom React hooks
- `/context` - React context for state management
- `/prisma` - Database schema and migrations

### Backend
- `/controllers` - Business logic for routes
- `/models` - Mongoose schemas
- `/routes` - API endpoints
- `/index.js` - Server entry point

## Key Features
- User authentication (register/login)
- Mentor discovery and filtering
- Course management
- User messaging system
- Progress tracking
- Role-based access (Student, Instructor, Admin)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Important Notes
- Never commit sensitive files (`.env`, `mongocnx.txt`)
- Use `.env.example` as a template for environment variables
- Ensure MongoDB connection string is valid
- JWT_SECRET should be changed in production
- Check `.gitignore` for excluded files

## Future Enhancements
- Payment integration
- Video call functionality
- Advanced course filtering
- User reviews and ratings
- Social features (followers, recommendations)
