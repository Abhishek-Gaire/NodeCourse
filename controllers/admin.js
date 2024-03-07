
const Product  = require('../models/product');
const {validationResult} = require("express-validator")

exports.getAddProduct = (req, res, next) => {

    res.render("admin/edit-product", {
        pageTitle:"Add Product",
        path:"/admin/add-product",
        editing:false,
        errorMessage: null,
        hasError:false,
    });
};

exports.postAddProduct = (req, res, next) => {
    const title= req.body.title;
    const imageUrl= req.body.imageUrl;
    const price= req.body.price;
    const description= req.body.description;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render("admin/edit-product", {
            pageTitle:"Add Product",
            path:"/admin/add-product",
            editing:false,
            hasError: true,
            product:{
                title:title,
                price:price,
                description:description,
                imageUrl:imageUrl,
            },
            errorMessage:errors.array()[0].msg,
        });
    }
    const product= new Product({
        title:title,
        price:price,
        description:description,
        imageUrl:imageUrl,
        userId: req.user
    });
    product
        .save()
        .then(result => {
            console.log("Created Product");
            res.redirect("/admin/products");
        })
        .catch(err => {
            // console.log(err);
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}
    
exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit; //from the URL ?edit=true
    if(!editMode){
        return res.redirect("/");
    }
    const prodId= req.params.productId;
    Product.findById(prodId)
    .then(product => {
        if(!product){
            return res.redirect("/");
        };
        res.render("admin/edit-product", {
            pageTitle:"Edit Product",
            path:"/admin/edit-product",
            editing:editMode,
            product:product,
            errorMessage: null,
        });
    })
};
exports.postEditProduct = (req,res,next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render("admin/edit-product", {
            pageTitle:"Edit Product",
            path:"/admin/edit-product",
            editing:true,
            hasError: true,
            product:{
                title:updatedTitle,
                price:updatedPrice,
                description:updatedDescription,
                imageUrl:updatedImageUrl,
                _id:prodId,
            },
            errorMessage:errors.array()[0].msg,
        });
    }
    Product.findById(prodId)
    .then(product => {
        if(product.userId.toString() !== req.user._id.toString()){
            return res.redirect("/");
        }
        
        product.title= updatedTitle;
        product.imageUrl = updatedImageUrl;
        product.price = updatedPrice;
        product.description = updatedDescription;

        return product.save()
        .then(result => {
            console.log("UPDATED PRODUCTS");
            res.redirect("/admin/products");
        })  
    })
    .catch(err => {
        const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
    })
};
exports.postDeleteProduct = (req,res,next) => {
    const prodId = req.body.productId;
    Product.deleteOne({_id:prodId, userId : req.user._id})
    .then( () => {
        console.log("DESTROYED PRODUCT")
        res.redirect('/admin/products');
    })
    .catch(err =>{
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    })
};
exports.getProductsAdmin = (req,res,next) => {
    Product.find({userId: req.user._id})
    // .select()
    // .populate("userId")
    .then(products => {
        // console.log(products)
        res.render("admin/products", {
            prods:products,
            pageTitle:"Admin Products",
            path:"/admin/products",
        });
    }) 
    .catch(err =>{
        const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
    })
};