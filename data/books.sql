DROP TABLE IF EXISTS book;
DROP TABLE IF EXISTS books;

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    authors VARCHAR(255),
    isbn VARCHAR(255),
    image VARCHAR(255),
    decr TEXT,
    bookshelf VARCHAR(255)
);