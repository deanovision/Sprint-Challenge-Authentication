const axios = require("axios");
const bcrypt = require("bcryptjs");
const db = require("../database/dbConfig");
const jwt = require("jsonwebtoken");

const { authenticate } = require("../auth/authenticate");

module.exports = server => {
  server.post("/api/register", register);
  server.post("/api/login", login);
  server.get("/api/jokes", authenticate, getJokes);
};

function register(req, res) {
  // implement user registration
  const user = req.body;
  if (!user.username || !user.password) {
    res
      .status(400)
      .json({ message: "bad request username and password required" });
  } else {
    user.password = bcrypt.hashSync(user.password, 8);
    db("users")
      .insert(user)
      .then(id => {
        token = generateToken(id[0]);
        res.status(201).json({ id: id[0], token: token });
      })
      .catch(err => {
        res.status(500).json({ message: "internal error registering user" });
      });
  }
}

function login(req, res) {
  // implement user login
  const creds = req.body;
  if (!creds.username || !creds.password) {
    res.status(400).json({ message: "username and password required" });
  } else {
    db("users")
      .where({ username: creds.username })
      .first()
      .then(user => {
        if (
          creds.username &&
          bcrypt.compareSync(creds.password, user.password)
        ) {
          const token = generateToken(user.id);
          res.status(200).json({ id: user.id, token: token });
        } else {
          res.status(401).json({ message: "invalid credentials" });
        }
      })
      .catch(err => {
        res.status(500).json({ message: "internal error logging in" });
      });
  }
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: "application/json" }
  };

  axios
    .get("https://icanhazdadjoke.com/search", requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: "Error Fetching Jokes", error: err });
    });
}
function generateToken(id) {
  const payload = {
    subject: id
  };
  const options = {
    expiresIn: "1d"
  };
  return jwt.sign(payload, process.env.JWT_SECRET, options);
}
