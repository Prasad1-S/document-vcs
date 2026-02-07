-- Enum for access roles
CREATE TYPE access_role AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

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
