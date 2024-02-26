const Product  = require('../models/product');
const Order = require("../models/order")
exports.getProducts = (req, res, next) => {
    Product.find()
    .then(products => {
        res.render("shop/product-list", {
            prods:products,
            pageTitle:"All Products",
            path:"/products", 
            isAuthenticated: req.isLoggedIn,
        });
    })
    .catch(err => {
        console.log(err);
    })
};

exports.getProduct = (req,res,next) => {
    const productID = req.params.productId;
    Product.findById(productID)
    .then(product => {
        res.render("shop/product-detail", {
            product:product,
            pageTitle:product.title,
            path:"/products",
            isAuthenticated: req.isLoggedIn
        });
    })
    .catch(err => {
        console.log(err);
    })
};
exports.getIndex = (req,res,next) =>{
    Product.find()
    .then(products => {
        res.render("shop/index", {
            prods:products,
            pageTitle:"Shop",
            path:"/",
            isAuthenticated: req.isLoggedIn,
        });
    });
};

exports.getCart = (req,res,next) => {
    req.user
    .populate("cart.items.productId")
    // .execPopulate() do not need this
    .then(user =>{
        const products = user.cart.items;
            res.render("shop/cart", {
                pageTitle:"Your Cart",
                path:"/cart",   
                products:products,
                isAuthenticated: req.isLoggedIn,         
            });
    })
    .catch(err => {
        console.log(err);
    })
};

exports.postCart =(req,res,next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
    .then(product => {
        return req.user.addToCart(product);
    })
    .then(result => {
        res.redirect("/cart");
    })
};
exports.deleteFromCart= (req,res,next)=>{
    const prodId = req.body.productId; 
    req.user
    .removeFromCart(prodId)
    .then(result => {
        res.redirect("/cart");
    })
    .catch(err =>{
        console.log(err);
    })
};
exports.postOrder = (req,res,next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(i => {
                return {
                    productData:{
                        ...i.productId._doc
                    },
                    quantity: i.quantity,
                }
            });
            const order = new Order({
                products: products,
                user: {
                    name:req.user.name,
                    userId:req.user
                }
            });
            return order.save();   
        })
        .then(result =>{
            return req.user.clearCart()
        })
        .then(result => {
            res.redirect("/orders");
        })
        .catch(err =>{
            console.log(err);
        })
};
exports.getOrders = (req,res,next) => {
    Order.find({"user.userId":req.user._id})
        .then(orders => {
            res.render("shop/orders", {
                pageTitle:"Orders",
                path:"/orders",  
                orders: orders,
                isAuthenticated: req.isLoggedIn,          
            }); 
        });    
};
