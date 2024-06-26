
const Product  = require('../models/product');
const {validationResult} = require("express-validator")
const fileHelper = require("../util/file");

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
    const image= req.file;
    const price= req.body.price;
    const description= req.body.description;

    if(!image){
        return res.status(422).render("admin/edit-product", {
            pageTitle:"Add Product",
            path:"/admin/add-product",
            editing:false,
            hasError: true,
            product:{
                title:title,
                price:price,
                description:description,
            },
            errorMessage:"Attached file is not an Image"
        });
    }
    
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
            },
            errorMessage:errors.array()[0].msg,
        });
    }
    const imageUrl = image.path;
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
    const image = req.file;
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
        product.price = updatedPrice;
        product.description = updatedDescription;
        if(image){
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
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
exports.deleteProduct = (req,res,next) => {
    const prodId = req.params.productId;
    Product.findById(prodId).then(product=>{
        if(!product){
            return next(new Error("Product not found"))
        }
       fileHelper.deleteFile(product.imageUrl);
       return Product.deleteOne({_id:prodId, userId : req.user._id})
    }).then( () => {
        console.log("DESTROYED PRODUCT")
        res.status(200).json({message:"Deleted Successfully"});
    })
    .catch(err =>{
        res.status(500).json({message:"Deleting Failed"})
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