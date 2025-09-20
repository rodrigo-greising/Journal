# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a healthcare journaling application POC focused on enabling patients to input unstructured data (text/audio) for healthcare use cases including nutrition tracking and addiction treatment trigger identification.

### Core Architecture
- **Input-first design**: Prioritizes ease of use, especially during high-stress situations
- **Data processing pipeline**: Unstructured input → Cloud APIs → Structured data → Visualizations
- **Cross-platform web application**: Supports both mobile and desktop platforms

### Key Use Cases
- Addiction treatment trigger detection
- Nutrition pattern analysis
- Mental health trend identification

## Technology Stack

The project leverages the company's established technology stack:

### Frontend
- **TypeScript** with **React**
- **React Router** for full-stack web framework
- **Tailwind CSS** for styling

### Backend
- **NestJS** for API development
- **GraphQL** and **gRPC** for APIs
- **WebSockets** for real-time features
- **PostgreSQL** with **Redis** for caching

### Cloud & Infrastructure
- **AWS** cloud platform
- **Pulumi** for infrastructure as code

### Monitoring
- **Langfuse** for LLM observability
- **Datadog**, **Grafana**, **Sentry** for application monitoring
- **CloudWatch** for AWS monitoring

## Common Development Commands

### Root Level (Workspace Commands)
```bash
# Start both frontend and backend in development mode
npm run dev

# Build both applications
npm run build

# Run all tests
npm run test

# Start services individually
npm run dev:frontend  # React Router frontend on http://localhost:5173
npm run dev:backend   # NestJS backend on http://localhost:3001
```

### Frontend Commands (cd frontend/)
```bash
# Development server with Vite
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run typecheck
```

### Backend Commands (cd backend/)
```bash
# Development server with hot reload
npm run start:dev

# Build application
npm run build

# Start production server
npm start

# Lint and format code
npm run lint
npm run format

# Testing
npm test              # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run test:cov      # Run tests with coverage
npm run test:e2e      # Run end-to-end tests
```

## Architecture Overview

This is a monorepo using npm workspaces with two main applications:

### Frontend Architecture
- **React Router 7** with Vite for fast development
- **React 19** with TypeScript for type safety
- **Tailwind CSS v4** for styling
- Built-in TypeScript support and type generation

### Backend Architecture
- **NestJS** framework following modular architecture patterns
- **TypeScript** throughout with strict type checking
- **Jest** for unit and integration testing
- **Prettier + ESLint** for code formatting and quality
- Controllers, Services, and Modules following NestJS conventions

### Development Workflow
- Root package.json uses `concurrently` to run both services together
- Each service can be developed independently
- Shared TypeScript configuration and tooling across workspace

## Development Guidelines

- Prioritize existing stack technologies over introducing new alternatives
- Focus on accessibility and usability during high-stress situations
- Leverage established graphing libraries rather than building custom visualizations
- Plan for A/B testing of visualization approaches (word clouds vs textual summaries vs hybrid)

## Project Structure

```
/
├── docs/           # All project documentation
│   ├── product/    # Product documentation and requirements
│   ├── technical/  # Technical documentation
│   └── implementation/ # User stories and implementation planning
├── frontend/       # React Router frontend application
├── backend/        # NestJS backend API
└── infrastructure/ # AWS infrastructure as code (Pulumi)
```