-- first remove any data that may be present
TRUNCATE noteful_notes RESTART IDENTITY CASCADE;

-- insert some notes
INSERT INTO noteful_notes 
    (name, content, folder_id)
    VALUES
        ('Apple', 'apple content', 1),
        ('Banana', 'banana content', 2),
        ('Cats', 'meow', 3),
        ('Dogs', 'woof', 4);
