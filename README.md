# Healthcare Journal POC

A healthcare journaling application focused on enabling patients to input unstructured data (text/audio) for healthcare use cases including nutrition tracking and addiction treatment trigger identification.

## Quick Start

```bash
# Install dependencies
npm install

# Start both frontend and backend in development mode
npm run dev

# Or start individually:
npm run dev:frontend  # React Router frontend on http://localhost:5173
npm run dev:backend   # NestJS backend on http://localhost:3001
```

## Project Structure

```
/
├── frontend/       # React Router frontend application
├── backend/        # NestJS backend API
├── infrastructure/ # AWS infrastructure as code (Pulumi)
└── docs/          # All project documentation
```

## Technology Stack

- **Frontend**: React Router, React, TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript, GraphQL, gRPC, WebSockets
- **Database**: PostgreSQL with Redis for caching
- **Infrastructure**: AWS with Pulumi IaC
- **Monitoring**: Langfuse, Datadog, Grafana, Sentry

## Development

See individual README files in `frontend/` and `backend/` directories for specific setup instructions.