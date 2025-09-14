-- Initialize development database
-- This script runs when PostgreSQL container starts for the first time

-- Create additional databases
CREATE DATABASE zergoqr_dev;
CREATE DATABASE zergoqr_test;
CREATE DATABASE zergoqr_staging;

-- Enable UUID extension for all databases
\c zergoqr;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c zergoqr_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c zergoqr_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c zergoqr_staging;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Switch back to main database
\c zergoqr;

-- Create development user with appropriate permissions
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'zergoqr_dev') THEN
        CREATE USER zergoqr_dev WITH PASSWORD 'dev_password';
    END IF;
END
$$;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE zergoqr TO zergoqr_dev;
GRANT ALL PRIVILEGES ON DATABASE zergoqr_dev TO zergoqr_dev;
GRANT ALL PRIVILEGES ON DATABASE zergoqr_test TO zergoqr_dev;
GRANT ALL PRIVILEGES ON DATABASE zergoqr_staging TO zergoqr_dev;
