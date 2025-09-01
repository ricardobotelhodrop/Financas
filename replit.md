# Overview

FinanceFlow is a personal finance management application built with a full-stack TypeScript architecture. The app allows users to track income and expenses, categorize transactions, set savings goals, and view financial reports. It features a modern, responsive interface with dark mode support and comprehensive financial tracking capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Client-side routing implemented with Wouter for lightweight navigation
- **State Management**: React hooks (useState, useEffect) with local storage persistence and TanStack React Query for server state
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent, accessible design components
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Charts**: Chart.js integration for financial data visualization
- **Responsive Design**: Mobile-first approach with dedicated mobile header and sidebar components

## Backend Architecture
- **Server**: Express.js with TypeScript for API endpoints
- **Development Setup**: Hot reload with Vite integration for seamless development experience
- **Storage Interface**: Abstract storage pattern with initial in-memory implementation (MemStorage class)
- **Route Structure**: Modular route registration system with /api prefix for all backend endpoints
- **Error Handling**: Centralized error handling middleware with structured JSON responses

## Data Storage
- **Schema Definition**: Centralized schema using Zod for runtime validation and TypeScript types
- **Database Setup**: Drizzle ORM configured for PostgreSQL with migration support
- **Local Storage**: Browser localStorage for client-side data persistence in current implementation
- **Data Models**: 
  - Transactions (income/expense with categories and dates)
  - Categories (customizable with icons and colors)
  - Goals (savings targets with progress tracking)
  - User preferences (theme and app settings)

## Component Architecture
- **Layout System**: Responsive sidebar navigation with mobile-friendly header
- **Form Components**: Reusable form components for transactions, categories, and goals
- **Dashboard Components**: Modular financial cards, charts, and summary displays
- **UI Components**: Comprehensive shadcn/ui component library with custom theming

## Development Patterns
- **Type Safety**: Full TypeScript implementation with shared schemas between client and server
- **Code Organization**: Clear separation between client, server, and shared code with path aliases
- **Build Process**: Separate build commands for client (Vite) and server (esbuild) with production optimization
- **Theme System**: CSS variables-based theming with light/dark mode support

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form with Zod resolvers
- **Build Tools**: Vite with React plugin, TypeScript compiler, esbuild for server bundling
- **Development Tools**: tsx for TypeScript execution, Replit-specific plugins for development environment

## UI and Styling
- **Component Library**: Radix UI primitives for accessible, unstyled components
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **Charts**: Chart.js for data visualization
- **Animations**: Class Variance Authority for component variants

## Backend and Database
- **Database**: Neon Database (@neondatabase/serverless) for PostgreSQL hosting
- **ORM**: Drizzle ORM with Drizzle Kit for migrations and schema management
- **Session Management**: connect-pg-simple for PostgreSQL session storage
- **Server Framework**: Express.js with standard middleware

## State Management and Data
- **Client State**: TanStack React Query for server state management and caching
- **Validation**: Zod for schema validation and type generation
- **Date Handling**: date-fns for date manipulation and formatting with Portuguese locale support
- **Storage**: Browser localStorage with structured data persistence

## Development and Quality
- **TypeScript**: Full type safety with strict configuration
- **Linting and Formatting**: ESLint configuration for code quality
- **Path Resolution**: Custom path aliases for clean imports (@/, @shared/, @assets/)
- **Environment**: Replit-specific development tools and error handling