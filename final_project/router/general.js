const express = require('express');
const books = require('./booksdb.js');

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

function getBooks(res, callback){
  return new Promise((resolve, reject)=>{
    try{
      const books = require("./booksdb.js");
      const displayResponse = callback(books);
      res.send(JSON.stringify(displayResponse, null, 4));
    }catch(error){
      console.log("Unable retrieve books");
      res.status(404).json({message: "Unable to retrieve books"});
    }
  })
}

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  getBooks(res, (books)=>{
    return books;
  });
});



// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    getBooks(res, (books)=>{
      let book = books[req.params.isbn];
      if(book){
        return book;
      }else{
        return "Unable to find book with ISBN: " + req.params.isbn;
      }
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  getBooks(res, (books)=>{
    for (const [index, book] of Object.entries(books)) {
      if(book.author === req.params.author){
        return book;
      }
    }
   return "Author: \"" + req.params.author + "\" not found";
  })
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  getBooks(res, (books)=>{
    for(const index in books){
      let book = books[index];
      if(book.title === req.params.title){
        return book;
      }
    }
    return "Title: \"" + req.params.title + "\" not found";
  });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {

  getBooks(res, (books)=>{
    let book = books[req.params.isbn];

    if(book){
      if(Object.keys(book["reviews"]).length === 0){
        return `No reviews found yet!`;
      }
      return book["reviews"];
    }else{
      return "Unable to find book with ISBN: " + req.params.isbn;
    }
  })

});

module.exports.general = public_users;
