-- Users
INSERT INTO users (email, password, username, iscomplete)
VALUES
('alice@example.com', 'hashed_pwd_1', 'alice', true),
('bob@example.com', 'hashed_pwd_2', 'bob', true);

-- Documents
INSERT INTO documents (title, ownerid)
VALUES
('Project Spec', 1),
('Design Notes', 1);

-- Versions
INSERT INTO versions (docid, versioncount, content, createdby, commitmsg)
SELECT docid, 1, 'Initial draft', 1, 'initial commit'
FROM documents;

-- Update latest version
UPDATE documents
SET latestversion = v.versionid
FROM versions v
WHERE documents.docid = v.docid;

-- Access
INSERT INTO access (userid, docid, role)
SELECT 2, docid, 'editor'
FROM documents;
