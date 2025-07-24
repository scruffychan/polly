# Polly - Daily Dialogue for Change

## Overview

Polly is a web application designed to foster meaningful dialogue and positive change through daily controversial questions, research-backed discussions, and civic engagement. The app features real-time chat, sentiment analysis, and gamification elements to encourage constructive conversations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Real-time Communication**: WebSocket connections for live chat features

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with session-based authentication
- **Real-time Features**: WebSocket server for chat functionality
- **Deployment**: Configured for Replit hosting environment

### Design System
- **Color Palette**: Primary blue (#4A90E2), Secondary mint (#50E3C2), Accent orange (#FF9500)
- **Typography**: System fonts with 16px body text and 24px question text
- **Layout**: Card-based design with 16px padding and 8px border radius
- **Responsive**: Mobile-first design approach

## Key Components

### Daily Question System
- Single active question per day with multiple-choice options (3-5 answers)
- Automatic question expiration after 24 hours
- Vote tracking to prevent multiple submissions per user
- Results display as percentages after question expires

### Research Integration
- Curated research papers and reports for each question
- Collapsible interface to display credible, non-partisan sources
- Metadata tracking including source, year, and credibility badges

### Real-time Public Chat
- WebSocket-powered live messaging system
- Sentiment analysis using custom keyword-based algorithm
- Discussion tone meter displaying real-time sentiment
- User activity indicators and active user count

### Gamification & Engagement
- Badge system for constructive participation
- Action items section with civic engagement opportunities
- User feedback collection for future topic suggestions

### Administrative Interface
- Question creation and scheduling system
- Research paper management
- Action item configuration
- User feedback review system

## Data Flow

1. **Question Lifecycle**: Admin creates questions → Questions activate on schedule → Users vote → Results display after expiration
2. **Chat System**: Users send messages → Sentiment analysis → Real-time broadcast → UI updates
3. **Authentication**: Replit Auth → Session management → User context throughout app
4. **Data Persistence**: All interactions stored in PostgreSQL via Drizzle ORM

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React routing

### UI Components
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management

### Real-time & Authentication
- **ws**: WebSocket implementation
- **connect-pg-simple**: PostgreSQL session store
- **openid-client**: OAuth integration for Replit Auth

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety
- **esbuild**: Production bundling

## Deployment Strategy

### Development Environment
- Vite development server with HMR
- TypeScript compilation with strict mode
- Hot reload for both client and server code

### Production Build
- Client: Vite build to static assets
- Server: esbuild bundle to single executable
- Environment variables managed through Replit Secrets

### Database Management
- Drizzle migrations for schema changes
- Connection pooling for production performance
- Session storage in PostgreSQL for scalability

### Error Handling
- Client-side error boundaries
- Server-side error middleware
- User-friendly error messages
- Runtime error overlay in development

The application follows a monorepo structure with clear separation between client, server, and shared code, enabling maintainable development while supporting real-time features and complex user interactions.