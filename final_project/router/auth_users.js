const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  let userswithsamename = users.filter((user) => {
    return user.username === username;
});
}

const authenticatedUser = (username,password)=>{ //returns boolean
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
      // Generate JWT access token
      let accessToken = jwt.sign({
          data: password
      }, 'access', { expiresIn: 3600 });

      // Store access token and username in session
      req.session.authorization = {
          accessToken, username
      }
      return res.status(200).send("User successfully logged in");
  } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let currUser = req.session.authorization.username;
  let book = books[req.params.isbn];
  if(book){
    let reviews =  book["reviews"];
    for (const [user, review] of Object.entries(reviews)) {
      if(user === currUser){
        reviews[currUser] = req.body.review;
        book["reviews"] = reviews;
        books[req.params.isbn] = book;

        res.send("Updated:\n " + JSON.stringify(book, null, 4));
      }
    }
    book["reviews"][currUser] = req.body.review;
    books[req.params.isbn] = book;
    res.send("Added review: \n"+ JSON.stringify(book, null, 4));

  }else{
    res.send("Unable to find book with ISBN: " + req.params.isbn);
  }

});
regd_users.delete("/auth/review/:isbn", (req, res) => {
  let currUser = req.session.authorization.username;
  let book = books[req.params.isbn];
  console.log(currUser);
  if(book){
    let reviews =  book["reviews"];
    for (const [user, review] of Object.entries(reviews)) {
      if(user === currUser){
        delete reviews[currUser];
        console.log(books);
        res.send("Deleted review for ISBN: " + req.params.isbn);
      }
    }
    res.send("Unable to find review with ISBN: " + req.params.isbn);

  }
  res.send("Unable to find book with ISBN: " + req.params.isbn);

})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
