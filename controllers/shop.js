const Product  = require('../models/product');
const Order = require("../models/order")
exports.getProducts = (req, res, next) => {
    Product.find()
    .then(products => {
        res.render("shop/product-list", {
            prods:products,
            pageTitle:"All Products",
            path:"/products", 
            
        });
    })
    .catch(err => {
        const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
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
        });
    })
    .catch(err => {
        const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
    })
};
exports.getIndex = (req,res,next) =>{
    Product.find()
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
    .populate("cart.items.productId")
    // .execPopulate() do not need this
    .then(user =>{
        const products = user.cart.items;
            res.render("shop/cart", {
                pageTitle:"Your Cart",
                path:"/cart",   
                products:products,        
            });
    })
    .catch(err => {
        const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
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
        const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
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
                    email:req.user.email,
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
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
};
exports.getOrders = (req,res,next) => {
    Order.find({"user.userId":req.user._id})
        .then(orders => {
            res.render("shop/orders", {
                pageTitle:"Orders",
                path:"/orders",  
                orders: orders,       
            }); 
        });    
};
