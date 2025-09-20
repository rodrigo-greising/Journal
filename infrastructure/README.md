# Infrastructure Setup

## Local Development Database

This folder contains the Docker setup for running PostgreSQL locally for development.

### Starting the Database

```bash
# Start PostgreSQL container
docker-compose up -d

# Stop PostgreSQL container
docker-compose down

# View logs
docker-compose logs postgres

# Reset database (removes all data)
docker-compose down -v
docker-compose up -d
```

### Database Connection Details

- **Host**: localhost
- **Port**: 5433
- **Database**: journal_db
- **Username**: journal_user
- **Password**: journal_password

### Environment Variables for Backend

```env
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_NAME=journal_db
DATABASE_USERNAME=journal_user
DATABASE_PASSWORD=journal_password
```