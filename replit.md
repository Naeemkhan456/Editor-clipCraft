# Video Editor App

## Overview

This is a modern web-based video editing application built with React and TypeScript. The app provides an intuitive mobile-first interface for creating, editing, and exporting video content. It features a full-stack architecture with a React frontend and Express.js backend, designed to handle video project management, real-time editing, and video processing workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Component-based UI architecture using React 18 with TypeScript for type safety
- **Mobile-First Design**: Responsive interface optimized for mobile devices with touch-friendly controls
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design system
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design

### Backend Architecture
- **Express.js Server**: RESTful API server with middleware for request logging and error handling
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development (designed to be swapped with database)
- **Video Processing**: FFmpeg.wasm integration for client-side video processing and manipulation
- **Project Management**: CRUD operations for video projects with schema validation using Zod

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Design**: Structured project data including video clips, audio tracks, effects, and edit history
- **Session Management**: PostgreSQL session store with connect-pg-simple
- **File Storage**: Designed to handle video file uploads and processing (currently using mock data)

### Key Features
- **Video Timeline Editor**: Frame-by-frame timeline with seek controls and visual feedback
- **Real-time Filters**: Canvas-based filter processing with multiple effect options (brightness, contrast, vintage, etc.)
- **Project Management**: Create, save, and manage multiple video projects
- **Export System**: Configurable export settings for different platforms (YouTube, TikTok, Instagram)
- **Edit History**: Undo/redo functionality with action tracking
- **Mobile Navigation**: Bottom navigation bar optimized for mobile usage

### Development Architecture
- **Build System**: Vite for fast development and optimized production builds
- **Code Organization**: Monorepo structure with shared schemas between client and server
- **Type Safety**: Full TypeScript coverage with strict configuration
- **Development Tools**: Hot module replacement, error overlays, and development middleware

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection for serverless environments
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router

### UI and Styling
- **@radix-ui/***: Headless UI primitives for accessible components
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility

### Video Processing
- **@ffmpeg/ffmpeg**: WebAssembly-based video processing library
- **@ffmpeg/core**: Core FFmpeg functionality for browser-based video manipulation

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **zod**: Runtime type validation and schema definition
- **@replit/vite-plugin-***: Replit-specific development plugins

### Form and Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: Schema validation for forms and API data

### Utilities
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation
- **cmdk**: Command palette component