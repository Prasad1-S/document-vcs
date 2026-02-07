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
