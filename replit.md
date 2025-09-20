# Artesa POS - Point of Sale System

## Overview

Artesa POS is an offline-first point of sale system designed for retail businesses. The application provides comprehensive functionality for product management, transaction processing, and inventory tracking. Built with a focus on reliability and usability, it operates primarily offline using IndexedDB for local data storage, ensuring business continuity even without internet connectivity.

The system features a modern React-based frontend with a clean, professional interface optimized for touch interactions and data-dense displays. It includes modules for point of sale operations, inventory management, transaction history, and system settings with data import/export capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development practices
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible interface elements
- **Styling**: Tailwind CSS with custom design system following Material Design principles
- **State Management**: React Context API (POSContext) for global application state management
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack React Query for server state management and caching

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Connection**: Neon Database serverless PostgreSQL for cloud database hosting
- **Build System**: Vite for fast development and optimized production builds

### Data Storage Strategy
- **Primary Storage**: IndexedDB for offline-first data persistence
- **Local Storage**: Browser local storage for user preferences and temporary data
- **Database Schema**: Structured schemas for products, transactions, and cart items with Zod validation
- **Data Sync**: Designed for eventual consistency between local and remote storage

### Authentication and Session Management
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **User Management**: Basic user schema with extensible authentication system
- **Security**: Built-in CSRF protection and secure session handling

### Offline-First Design
- **Local Database**: IndexedDB implementation with automatic initialization and sample data seeding
- **Data Export/Import**: JSON-based backup and restore functionality for data portability
- **Conflict Resolution**: Designed to handle offline operations with eventual synchronization

### Component Architecture
- **Design System**: Professional color palette optimized for POS operations with semantic colors for different states
- **Layout System**: Responsive design with sidebar navigation and touch-friendly interface elements
- **Form Handling**: React Hook Form with Zod validation for robust form management
- **Image Handling**: File upload utilities with validation and default placeholder generation

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle Kit**: Database migration and schema management tools

### UI and Styling
- **Radix UI**: Accessible, unstyled UI primitives for complex components
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Modern icon library with consistent visual language
- **Google Fonts**: Web fonts (Inter, JetBrains Mono) for typography system

### Development Tools
- **Vite**: Fast build tool with hot module replacement and optimized bundling
- **TypeScript**: Static type checking for improved code quality and developer experience
- **ESBuild**: Fast JavaScript bundler for production builds

### Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation library
- **Hookform Resolvers**: Integration between React Hook Form and Zod

### Data Management
- **TanStack React Query**: Server state management with caching and synchronization
- **Date-fns**: Modern date utility library for date formatting and manipulation

### Runtime and Deployment
- **Replit Integration**: Development environment integration with runtime error handling
- **Connect PG Simple**: PostgreSQL session store for Express.js applications