const Product  = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    res.render("admin/add-product", {
        pageTitle:"Add Product",
        path:"/admin/add-product",
        activeAddProduct: true,
        formCSS: true,
        productCSS: true
    });
};

exports.postAddProduct = (req, res, next) => {
    const product= new Product(req.body.title);
    product.save();
    res.redirect("/");
};

exports.getProducts = (req, res, next) => {
    Product.fetchAll(products => {
        res.render("shop/product-list", {
            prods:products,
            pageTitle:"Shop",
            path:"/",
            hasProducts:products.length>0,
            activeSho: true,
            productCSS: true
        });

    });
};

exports.getProductsAdmin = (req,res,next) => {
    Product.fetchAll(products => {
        res.render("admin/products", {
            prods:products,
            pageTitle:"Admin Products",
            path:"/admin/products",
            hasProducts:products.length>0,
            activeSho:true,
            productCSS: true
        });
    });
};