const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!isValid(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  let book = books[req.params.isbn];
  if(book){
    res.send(JSON.stringify(book, null, 4));
  }else{
    res.send("Unable to find book with ISBN: " + req.params.isbn);
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  for (const [index, book] of Object.entries(books)) {
    if(book.author === req.params.author){
      res.send(JSON.stringify(book, null, 4));
      return;
    }
  }
  res.send("Author: \"" + req.params.author + "\" not found");
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  for (const [index, book] of Object.entries(books)) {
    if(book.title === req.params.title){
      res.send(JSON.stringify(book, null, 4));
      return;
    }
  }
  res.send("Title: \"" + req.params.title + "\" not found");
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let book = books[req.params.isbn];

  if(book){
    res.send(JSON.stringify(book["reviews"], null, 4));
  }else{
    res.send("Unable to find book with ISBN: " + req.params.isbn);
  }
});

module.exports.general = public_users;
