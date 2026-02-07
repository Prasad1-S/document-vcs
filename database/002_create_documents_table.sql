CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE documents (
    docid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    ownerid BIGINT,
    createdat TIMESTAMPTZ DEFAULT now(),
    updatedat TIMESTAMPTZ DEFAULT now(),
    latestversion BIGINT,
    CONSTRAINT documents_ownerid_fkey
        FOREIGN KEY (ownerid)
        REFERENCES users(userid)
);
