const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username, req)=>{ //returns boolean

  if(req.session.authorization.username === username) {
    return true;
  }
  return false;
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
      return res.status(400).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
      // Generate JWT access token
      let accessToken = jwt.sign({
          data: password
      }, 'access', { expiresIn: 60 * 60 });

      // Store access token and username in session
      req.session.authorization = {
          accessToken, username
      }
      return res.status(200).send("User successfully logged in");
  } else {
      return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

  let isbn = req.params.isbn;
  let username = req.body.username;
  let review = req.body.review;

  if(!isValid(username, req)) {
    return res.status(401).json({ message: 'The provided user is not logged in' });
  }

  // Return 200 if any book with the same isbn is found, otherwise 404
  if (books[isbn]) {
    let added = books[isbn].reviews[username]? false : true;
    books[isbn].reviews[username] = review;

    return res.status(200).json({'message': 'The review has been '+ (added? 'added':'modified')});
  } else {
    return res.status(404).send('The provided ISBN returned no book.');
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

  let isbn = req.params.isbn;

  // Return 200 if any book with the same isbn is found, otherwise 404
  if (books[isbn]) {
    delete books[isbn].reviews[req.session.authorization.username];

    return res.status(200).json({'message': 'The review has been deleted'});
  } else {
    return res.status(404).send('The provided ISBN returned no book.');
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
