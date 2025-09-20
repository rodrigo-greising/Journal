# Infrastructure Setup

## Local Development Services

This folder contains the Docker setup for running PostgreSQL and Redis locally for development.

### Starting the Services

```bash
# Start all services (PostgreSQL + Redis)
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs postgres
docker-compose logs redis

# Reset all data (removes all data)
docker-compose down -v
docker-compose up -d
```

### Database Connection Details

- **Host**: localhost
- **Port**: 5433
- **Database**: journal_db
- **Username**: journal_user
- **Password**: journal_password

### Redis Connection Details

- **Host**: localhost
- **Port**: 6380
- **Password**: None (no authentication required)

### Environment Variables for Backend

Create a `.env` file in the backend directory with these variables:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_NAME=journal_db
DATABASE_USERNAME=journal_user
DATABASE_PASSWORD=journal_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6380
# REDIS_PASSWORD= (leave empty for no authentication)

# OpenAI Configuration
# OPENAI_API_KEY=your_openai_api_key_here
```