CREATE TABLE Universities (
    uniID INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    num_students INT,
    pictures TEXT
);