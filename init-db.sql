CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE group_type AS ENUM (
    'admin',
    'user',
    'manager'
);

CREATE TABLE accesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personId UUID REFERENCES people(id) ON DELETE RESTRICT,
    groupType group_type NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(personId, groupType)
);

CREATE TYPE appointment_status AS ENUM (
    'scheduled',
    'cancelled',
    'sent'
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personId UUID REFERENCES people(id) ON DELETE CASCADE,
    scheduledAt TIMESTAMP NOT NULL,
    status appointment_status DEFAULT 'scheduled',
    emails TEXT[] NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointmentId UUID REFERENCES appointments(id) ON DELETE CASCADE,
    emailTitle VARCHAR(255) NOT NULL,
    emailBody TEXT NOT NULL,
    emails TEXT[] NOT NULL,
    rabbitQueueId VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

WITH new_user AS (
    INSERT INTO people (name, email, password)
    VALUES 
    ('JOÂO NINGUEM', 'BEFELIX07@GMAIL.COM', '$2b$12$2ufZiuGdmSiS/LqVmKy6NOOh/2rbc2I4vdUzsQ8/s1l0DXOj7I6Ym')
    RETURNING id
)
INSERT INTO accesses (personId, groupType)
SELECT id, 'admin' FROM new_user;
