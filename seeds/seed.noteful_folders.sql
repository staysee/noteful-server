-- first remove any data that may be present
TRUNCATE noteful_folders RESTART IDENTITY CASCADE;

-- insert some folders
INSERT INTO noteful_folders
    (name)
    VALUES
        ('Folder One'),
        ('Folder Two'),
        ('Folder Three'),
        ('Folder Four');