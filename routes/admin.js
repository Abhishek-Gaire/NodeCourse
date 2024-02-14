const path = require("path");

const express = require("express");

const adminController = require("../controllers/admin");
const router = express.Router();


// only for post
router.post("/add-product", adminController.postAddProduct );
router.get("/add-product", adminController.getAddProduct);
router.get("/products", adminController.getProductsAdmin);


module.exports = router;
