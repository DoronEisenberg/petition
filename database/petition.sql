DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS more_information;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signatures (
     id SERIAL PRIMARY KEY,
      -- firstname VARCHAR NOT NULL CHECK (firstname != ''),
      -- lastname VARCHAR NOT NULL CHECK (lastname != ''),
     signature VARCHAR NOT NULL CHECK (signature != ''),
     user_id INT NULL UNIQUE REFERENCES users(id)
);

CREATE TABLE more_information (
     id SERIAL PRIMARY KEY,
     age VARCHAR NOT NULL CHECK (age != ''),
     city VARCHAR NOT NULL CHECK (city != ''),
     homepage VARCHAR NOT NULL CHECK (homepage != ''),
     user_id INT NULL UNIQUE REFERENCES users(id)
);