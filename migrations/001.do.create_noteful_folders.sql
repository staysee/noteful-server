-- DROP TABLE IF EXISTS noteful_folders;

CREATE TABLE noteful_folders (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    folder_name TEXT NOT NULL
);