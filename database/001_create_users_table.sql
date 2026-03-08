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

