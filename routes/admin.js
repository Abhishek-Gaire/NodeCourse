const path = require("path");

const express = require("express");

const productsController = require("../controllers/products");
const router = express.Router();


// only for post
router.post("/add-product", productsController.postAddProduct );
router.get("/add-product", productsController.getAddProduct);
router.get("/products", productsController.getProductsAdmin);


module.exports = router;
