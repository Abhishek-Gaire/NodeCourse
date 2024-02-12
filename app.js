const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

//Middleware
app.use("/add-product", (req, res, next) => {

    res.send("<form action='/product' method='post'><input type='text' name='title'><button type='submit'>Add Product</button></form>") //Sends a response back to the client 
});

// only for post
app.post("/product", (req, res, next) => {
    console.log(req.body);
    res.redirect("/");
})
app.use("/", (req, res, next) => {

    res.send("<h1>Hello From Express Generated Server</h1>") //Sends a response back to the client 
});

app.listen(3000);