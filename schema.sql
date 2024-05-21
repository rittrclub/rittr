CREATE TABLE users (
    user_id int,
    username VARCHAR(256) NOT NULL,
    display_name VARCHAR(256),
    about TEXT,
    photo VARCHAR(256),
    background VARCHAR(256),
    passwd character varying,
    salt character varying,
    is_deleted boolean DEFAULT false,
    created_by int NOT NULL,
    created_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by int,
    modified_date TIMESTAMPTZ,
    PRIMARY KEY(user_id),
    UNIQUE(username)
);

CREATE TABLE user_stats (
    user_id int NOT NULL,
    posts int DEFAULT 0,
    comments int DEFAULT 0,
    reactions int DEFAULT 0,
    bookmarks int DEFAULT 0,
    votes int DEFAULT 0,
    views int DEFAULT 0,
    likes int DEFAULT 0,
    following int DEFAULT 0,
    followers int DEFAULT 0,
    reposts int DEFAULT 0,
    modified_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(user_id)
);

CREATE TABLE posts (
    post_id int,
    community_id int,
    title VARCHAR(256),
    slug VARCHAR(256),
    body text NOT NULL,
    summary text NOT NULL,
    readtime int,
    tags VARCHAR(256) NOT NULL default '',
    metadata JSONB,
    poster character varying,
    photos character varying,
    reply_to int,
    thread_id int,
    root_id int,
    owner_id int NOT NULL,
    ip VARCHAR(256),
    app_id int,
    is_deleted boolean DEFAULT false,
    created_by int NOT NULL,
    created_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_by int,
    modified_date TIMESTAMPTZ,
    PRIMARY KEY(post_id),
    UNIQUE(slug)
);

CREATE TABLE following (
    user_id int NOT NULL,
    following_id int NOT NULL,
    created_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, following_id)
);

CREATE TABLE reactions (
    user_id int NOT NULL,
    post_id int NOT NULL,
    reaction INT,
    created_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE bookmarks (
    user_id int NOT NULL,
    post_id int NOT NULL,
    created_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE post_stats (
    post_id int NOT NULL,
    reactions int DEFAULT 0,
    bookmarks int DEFAULT 0,
    comments int DEFAULT 0,
    views int DEFAULT 0,
    likes int DEFAULT 0,
    followers int DEFAULT 0,
    reposts int DEFAULT 0,
    votes int DEFAULT 0,
    rank int DEFAULT 0,
    modified_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id)
);