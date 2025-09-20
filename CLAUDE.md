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
- **Remix** for full-stack web framework
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
│   │   └── mvp.md  # MVP specifications and requirements
│   ├── technical/  # Technical documentation
│   │   └── stack.md # Available technology stack reference
│   └── implementation/ # User stories and implementation planning
│       ├── README.md   # Implementation roadmap and priority order
│       └── *.md        # Individual user story files with acceptance criteria
├── frontend/       # Remix React frontend application
├── backend/        # NestJS backend API
└── infrastructure/ # AWS infrastructure as code (Pulumi)
```