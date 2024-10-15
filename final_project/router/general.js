const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
      return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
      return true;
  } else {
      return false;
  }
}

public_users.post("/register", (req,res) => {

  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!doesExist(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(201).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(409).json({message: "User already exists!"});
      }
  }
  // Return error if username or password is missing
  return res.status(422).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {

  const booksCall = new Promise((resolve, reject) => {

    try {
        resolve(JSON.stringify(books, null, 4));
    } catch (err) {
        reject(err);
    }
  });

  booksCall.then(

    (data) => {
      return res.status(200).send(data);
    },

    (err) => {
      return res.status(500).json({'message': 'An error occurred while retrieving the books'});
    }
  );
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {

  const isbn = req.params.isbn;

  const booksCall = new Promise((resolve, reject) => {

    try {
        resolve(books[isbn]? JSON.stringify(books[isbn], null, 4) : null);
    } catch (err) {
        reject(err);
    }
  });

  booksCall.then(

    (data) => {
      if(data) {
        return res.status(200).send(data);
      } else {
        return res.status(404).send('The provided ISBN returned no book.');
      }
    },

    (err) => {
      return res.status(500).json({'message': 'An error occurred while retrieving the books'});
    }
  );
 });

// Get book details based on author
public_users.get('/author/:author',function (req, res) {

  const author = req.params.author;

  const booksCall = new Promise((resolve, reject) => {

    try {
      let foundBooks = {};

      for(let isbn in books) {
        if(author === books[isbn].author) {
          foundBooks[isbn] = books[isbn];
        }
      }
      resolve(Object.keys(foundBooks).length > 0? JSON.stringify(foundBooks, null, 4) : null);
    } catch (err) {
      reject(err);
    }
  });

  booksCall.then(

    (data) => {
      if(data) {
        return res.status(200).send(data);
      } else {
        return res.status(404).send('The provided author returned no book.');
      }
    },

    (err) => {
      return res.status(500).json({'message': 'An error occurred while retrieving the books'});
    }
  );
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {

  const title = req.params.title;

  const booksCall = new Promise((resolve, reject) => {

    try {
      let foundBooks = {};

      for(let isbn in books) {
        if(title === books[isbn].title) {
          foundBooks[isbn] = books[isbn];
        }
      }
      resolve(Object.keys(foundBooks).length > 0? JSON.stringify(foundBooks, null, 4) : null);
    } catch (err) {
      reject(err);
    }
  });

  booksCall.then(

    (data) => {
      if(data) {
        return res.status(200).send(data);
      } else {
        return res.status(404).send('The provided title returned no book.');
      }
    },

    (err) => {
      return res.status(500).json({'message': 'An error occurred while retrieving the books'});
    }
  );
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {

  let isbn = req.params.isbn;

  // Return 200 if any book with the same isbn is found, otherwise 404
  if (books[isbn]) {
    return res.status(200).send(
      JSON.stringify(books[isbn].reviews, null, 4)
    );
  } else {
    return res.status(404).send('The provided ISBN returned no book.');
  }
});

module.exports.general = public_users;
