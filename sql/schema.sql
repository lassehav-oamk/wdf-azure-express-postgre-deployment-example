-- Create Greetings table
CREATE TABLE Greetings (
    Id SERIAL PRIMARY KEY,
    Text VARCHAR(500) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO Greetings (Text) VALUES
    ('Hello, World!'),
    ('Welcome to Azure PostgreSQL!'),
    ('Good morning!'),
    ('Have a great day!');

-- Query to verify
SELECT * FROM Greetings;
