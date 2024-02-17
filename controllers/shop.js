const Product  = require('../models/product');
const cart = require("../models/cart")
exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render("shop/product-list", {
            prods:products,
            pageTitle:"All Products",
            path:"/products", 
        });
    });
};

exports.getProduct = (req,res,next) => {
    const productID = req.params.productId;
    Product.findById(productID, product => {
        res.render("shop/product-detail", {
            product:product,
            pageTitle:product.title,
            path:"/products"
        });
    });
};
exports.getIndex = (req,res,next) =>{
    Product.fetchAll(products => {
        res.render("shop/index", {
            prods:products,
            pageTitle:"Shop",
            path:"/",  
        });
    });
};

exports.getCart = (req,res,next) => {
    cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts =[];
            for(let product of products){
                const cartProductsData = cart.products.find(prod => prod.id === product.id);
                if(cartProductsData){
                    cartProducts.push(
                        {
                            productData:product,
                            qty:cartProductsData.qty
                        }
                    );
                }
            }
            res.render("shop/cart", {
                pageTitle:"Your Cart",
                path:"/cart",   
                products:cartProducts         
            });

        })

    })
};

exports.postCart =(req,res,next) => {
    const prodId = req.body.productId;
    Product.findById(prodId, product => {
        cart.addProduct(prodId, product.price);
    });
    res.redirect("/cart");
};
exports.deleteFromCart= (req,res,next)=>{
    const prodId = req.body.productId;
    Product.findById(prodId, product => {
        cart.deleteProduct(prodId ,product.price)
        res.redirect("/cart");
    });
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