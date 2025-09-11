# Wered Admin Panel

A React-based admin panel for managing the Wered Islamic app backend. This panel provides essential administrative functionality for user management, group moderation, content management, and system monitoring.

## Features

- 🔐 **Secure Authentication** - JWT-based admin authentication
- 👥 **User Management** - View, search, and moderate user accounts
- 🕌 **Group Management** - Monitor Khitma and Dhikr groups
- 📖 **Content Management** - Manage motivational verses and Islamic content
- 📊 **Analytics Dashboard** - System metrics and usage insights
- ⚙️ **System Settings** - Configure app behavior and features

## Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Vite for fast development
- **State Management**: React Context API + useReducer

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Access to the Wered Laravel API backend

### Installation

1. Clone the repository and navigate to the admin panel:
   ```bash
   cd admin-panel
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Update the API base URL in `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts for state management
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── services/       # API service layer
├── types/          # TypeScript type definitions
├── utils/          # Utility functions and configuration
├── App.tsx         # Main application component
└── main.tsx        # Application entry point
```

## Environment Configuration

The application uses a single environment configuration:

- `.env` - Main configuration file (created from .env.example)
- `.env.example` - Example configuration template

### Required Environment Variables

- `VITE_API_BASE_URL` - Base URL for the Laravel API backend
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

## API Integration

The admin panel integrates with the existing Laravel Sanctum API. Ensure the backend is running and accessible at the configured API base URL.

### Authentication

The panel uses JWT token-based authentication with automatic token refresh and secure storage.

### API Endpoints

All API endpoints are configured in `src/utils/config.ts` and follow RESTful conventions.

## Development Guidelines

### Code Style

- Use TypeScript for all components and utilities
- Follow React functional component patterns with hooks
- Use Tailwind CSS for styling with custom component classes
- Implement proper error handling and loading states

### Component Structure

- Keep components small and focused
- Use custom hooks for complex logic
- Implement proper TypeScript interfaces
- Add proper error boundaries

### State Management

- Use React Context for global state
- Use local useState for component-specific state
- Implement proper loading and error states
- Use useReducer for complex state logic

## Building for Production

1. Update environment variables in `.env` for production values
2. Build the application:
   ```bash
   npm run build
   ```
3. The built files will be in the `dist/` directory
4. Deploy to your preferred static hosting service

## Security Considerations

- All API requests include authentication tokens
- Input validation and sanitization
- XSS protection through proper escaping
- Secure token storage and automatic cleanup
- Role-based access control

## Contributing

1. Follow the existing code style and patterns
2. Add proper TypeScript types for new features
3. Include error handling and loading states
4. Test components thoroughly
5. Update documentation as needed

## License

This project is part of the Wered Islamic app ecosystem.