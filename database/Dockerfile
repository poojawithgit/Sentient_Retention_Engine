# Use PostgreSQL 15 Alpine
FROM postgres:15-alpine

# Copy initialization scripts
COPY init.sql /docker-entrypoint-initdb.d/

# Expose port
EXPOSE 5432

# Environment variables will be set in docker-compose