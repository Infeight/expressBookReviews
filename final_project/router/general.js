const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
 const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });

  return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () =>
      new Promise((resolve, reject) => {
        if (books) {
          resolve(books);
        } else {
          reject("No books available");
        }
      });

    const bookList = await getBooks();
    return res.status(200).json(bookList);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = () =>
    new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject("Book not found");
      }
    });

  try {
    const book = await getBookByISBN();
    return res.status(200).json(book);
  } catch (err) {
    return res.status(404).json({ message: err });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author.toLowerCase();

  const getBooksByAuthor = () =>
    new Promise((resolve, reject) => {
      const matchingBooks = Object.values(books).filter(book =>
        book.author.toLowerCase() === author
      );

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found by this author");
      }
    });

  try {
    const booksByAuthor = await getBooksByAuthor();
    return res.status(200).json(booksByAuthor);
  } catch (err) {
    return res.status(404).json({ message: err });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title.toLowerCase();

  const getBooksByTitle = () =>
    new Promise((resolve, reject) => {
      const matchingBooks = Object.values(books).filter(book =>
        book.title.toLowerCase() === title
      );

      if (matchingBooks.length > 0) {
        resolve(matchingBooks);
      } else {
        reject("No books found with this title");
      }
    });

  try {
    const booksByTitle = await getBooksByTitle();
    return res.status(200).json(booksByTitle);
  } catch (err) {
    return res.status(404).json({ message: err });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
   const isbn = req.params.isbn;

  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
