const express = require("express");

const {
  createUserMessage
} = require("../Controllers/UserMessage");

const router = express.Router();

// Create user message
router.post("/message", createUserMessage);

module.exports = router;