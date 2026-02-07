CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE access_role AS ENUM ('owner', 'editor', 'viewer');

CREATE TABLE users (
    userid BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    username TEXT UNIQUE,
    imgurl TEXT,
    iscomplete BOOLEAN DEFAULT FALSE,
    createdat TIMESTAMPTZ DEFAULT now(),
    updatedat TIMESTAMPTZ DEFAULT now()
);

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

CREATE TABLE versions (
    versionid BIGSERIAL PRIMARY KEY,
    docid UUID NOT NULL,
    versioncount BIGINT NOT NULL,
    content TEXT,
    createdby BIGINT,
    commitmsg TEXT,
    createdat TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT versions_docid_fkey
        FOREIGN KEY (docid)
        REFERENCES documents(docid)
        ON DELETE CASCADE,

    CONSTRAINT versions_createdby_fkey
        FOREIGN KEY (createdby)
        REFERENCES users(userid),

    CONSTRAINT versions_docid_versioncount_unique
        UNIQUE (docid, versioncount)
);

ALTER TABLE documents
ADD CONSTRAINT fk_documents_latestversion
FOREIGN KEY (latestversion)
REFERENCES versions(versionid);

CREATE TABLE access (
    userid BIGINT NOT NULL,
    docid UUID NOT NULL,
    role access_role NOT NULL,
    grantedat TIMESTAMPTZ DEFAULT now(),

    CONSTRAINT access_pkey PRIMARY KEY (userid, docid),

    CONSTRAINT access_userid_fkey
        FOREIGN KEY (userid)
        REFERENCES users(userid),

    CONSTRAINT access_docid_fkey
        FOREIGN KEY (docid)
        REFERENCES documents(docid)
        ON DELETE CASCADE
);
