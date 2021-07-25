const express = require("express");
const router = express.Router();

const { blog } = require("../controllers/blog");

router.get("/", blog);

module.exports = router;
