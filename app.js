const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const errorController = require("./controllers/error");
const User = require("./models/user")

const app = express();

app.set("view engine", "ejs");
app.set("views" , "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop")


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); //Static files

app.use((req,res,next) => {
    User.findById("65d9c45bd72ae5bda1cc78b8")
    .then(user => {
        req.user =user ;
        next();
    })
    .catch(err => {
        console.log(err);
    })
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect(process.env.CONNECTION_STRING)
.then(result => {
    User.findOne().then(user => {
        if(!user){
            const user = new User({
                name:"Abhishek",
                email: "abhishekgaire7@gmail.com",
                cart : {
                    items: []
                }
            });
            user.save();
        }
    })
   
    app.listen(3000, () => {
        console.log("Connected To Database");
    });
    
}).catch(err => {
    console.log(err);
})
