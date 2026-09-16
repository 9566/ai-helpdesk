-- Enable pgvector for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('employee','agent','manager','admin')),
    status          VARCHAR(20) NOT NULL DEFAULT 'Active',
    avatar_initials VARCHAR(5),
    department      VARCHAR(100),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id                  VARCHAR(20) PRIMARY KEY,
    title               VARCHAR(255) NOT NULL,
    description         TEXT NOT NULL,
    category            VARCHAR(30) NOT NULL,
    priority            VARCHAR(20) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'Open',
    employee_id         UUID REFERENCES users(id),
    employee_name       VARCHAR(100),
    assignee_id         UUID REFERENCES users(id),
    assignee_name       VARCHAR(100),
    sla_deadline        TIMESTAMP NOT NULL,
    sla_breached        BOOLEAN DEFAULT FALSE,
    ai_classified       BOOLEAN DEFAULT FALSE,
    needs_manual_triage BOOLEAN DEFAULT FALSE,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW()
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   VARCHAR(20) REFERENCES tickets(id),
    author_id   UUID REFERENCES users(id),
    author_name VARCHAR(100),
    author_role VARCHAR(20),
    content     TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Activity Events Table
CREATE TABLE IF NOT EXISTS activity_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id   VARCHAR(20) REFERENCES tickets(id),
    type        VARCHAR(30) NOT NULL,
    description TEXT NOT NULL,
    user_id     UUID REFERENCES users(id),
    user_name   VARCHAR(100),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Knowledge Base Documents Table
CREATE TABLE IF NOT EXISTS kb_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name       VARCHAR(255) NOT NULL,
    title           VARCHAR(255),
    category        VARCHAR(100),
    content         TEXT,
    status          VARCHAR(20) DEFAULT 'Processing',
    chunk_count     INTEGER,
    failure_reason  TEXT,
    uploaded_by     UUID REFERENCES users(id),
    uploaded_at     TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- KB Chunks (pgvector)
CREATE TABLE IF NOT EXISTS kb_chunks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id     UUID REFERENCES kb_documents(id) ON DELETE CASCADE,
    chunk_index     INTEGER NOT NULL,
    content         TEXT NOT NULL,
    embedding       vector(768),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Vector Index (ivfflat)
-- We need enough data for ivfflat to be built correctly, but we'll define it here.
-- Note: ivfflat recommends building index AFTER inserting data for better clustering.
-- For a small system, we can skip the index or create it anyway.
-- CREATE INDEX IF NOT EXISTS kb_chunks_embedding_idx ON kb_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
