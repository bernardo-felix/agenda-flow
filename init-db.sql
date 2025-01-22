CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE group_type_enum AS ENUM (
    'admin',
    'user',
    'manager'
);

CREATE TABLE accesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID REFERENCES people(id) ON DELETE RESTRICT,
    group_type group_type_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(person_id, group_type)
);

CREATE TYPE appointment_status_enum AS ENUM (
    'scheduled',
    'Processing',
    'cancelled',
    'sent'
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID REFERENCES people(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMP NOT NULL,
    status appointment_status_enum DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE appointments_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
    subject VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    emails TEXT[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

WITH new_user AS (
    INSERT INTO people (name, email, password)
    VALUES 
    ('JOÂO NINGUEM', 'TESTE@GMAIL.COM', '$argon2id$v=19$m=65536,t=3,p=4$O1836cmx9qWwQqjQMCpbNA$YOqfgB7WDfrFfGLqZTUd1F/XofW2MQwEH6QrFk1W12g')
    RETURNING id
)
INSERT INTO accesses (person_id, group_type)
SELECT id, 'admin' FROM new_user;
