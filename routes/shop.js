const path = require("path");

const express = require("express");

const rootDir = require("../util/path");
const router = express.Router();
router.get("/", (req, res, next) => {

    res.sendFile(path.join(rootDir, "views", "shop.html")) //Sends a html file  back to the client 
});

module.exports = router;