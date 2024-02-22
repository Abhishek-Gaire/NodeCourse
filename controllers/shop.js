const Product  = require('../models/product');

exports.getProducts = (req, res, next) => {
    Product.fetchAll()
    .then(products => {
        res.render("shop/product-list", {
            prods:products,
            pageTitle:"All Products",

            path:"/products", 
        });
    });
};

exports.getProduct = (req,res,next) => {
    const productID = req.params.productId;
    Product.findById(productID)
    .then(product => {
        res.render("shop/product-detail", {
            product:product,
            pageTitle:product.title,
            path:"/products"
        });
    });
};
exports.getIndex = (req,res,next) =>{
    Product.fetchAll()
    .then(products => {
        res.render("shop/index", {
            prods:products,
            pageTitle:"Shop",
            path:"/",  
        });
    });
};

exports.getCart = (req,res,next) => {
    req.user
    .getCart()
    .then(products =>{
            res.render("shop/cart", {
                pageTitle:"Your Cart",
                path:"/cart",   
                products:products         
            });
    });
};

exports.postCart =(req,res,next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
    .then(product => {
        return req.user.addToCart(product);
    })
    .then(result => {
        console.log(result);
        res.redirect("/cart");
    })
};
exports.deleteFromCart= (req,res,next)=>{
    const prodId = req.body.productId; 
    req.user
    .deleteItemFromCart(prodId)
    .then(result => {
        res.redirect("/cart");
    })
    .catch(err =>{
        console.log(err);
    })
};
exports.postOrder = (req,res,next) => {
    req.user
    .addOrder()
    .then(result =>{
        res.redirect("/orders");
    })
    .catch(err =>{
        console.log(err);
    })
};
exports.getOrders = (req,res,next) => {
    res.render("shop/orders", {
        pageTitle:"Orders",
        path:"/orders",            
    }); 
};
exports.getCheckout= (req,res,next) => {
    res.render("shop/checkout", {
        pageTitle:"Checkout",
        path:"/checkout"
    });
};