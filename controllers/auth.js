const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const {validationResult} = require("express-validator");

const User = require("../models/user");

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'abhisekgaire7@gmail.com',
      pass: process.env.EMAIL_PASSWORD,
    }
  });

exports.getLogin = (req,res,next) => {
    let message = req.flash("error");
    if(message.length>0){
        message = message[0];
    } else{
        message = null;
    }
    res.render("auth/login", {
        path: "/login",
        pageTitle: "Login",
        errorMessage: message,
        oldInput: {
            email:"",
            password:"",
        },
        validationErrors: [],
    });
};
exports.postLogin = (req, res, next) =>{
    const email = req.body.email
    const password = req.body.password;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422)
            .render("auth/login", {
                path:"/login",
                pageTitle: "Login",
                errorMessage: errors.array()[0].msg,
                oldInput: {
                    email:email,
                    password:password,
                },
                validationErrors: errors.array(),
            })
    }

    User.findOne({email:email})
    .then(user => {
        if(!user){
            return res.status(422)
                .render("auth/login", {
                    path:"/login",
                    pageTitle: "Login",
                    errorMessage: "Email does not exist",
                    oldInput: {
                        email:email,
                        password:password,
                    },
                    validationErrors:[],
            })
        }
        bcrypt.compare(password, user.password)
        .then(doMatch=>{
            if(doMatch){
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save(err => {
                    // console.log(err);
                    res.redirect("/");
                });
            }
            return res.status(422)
                .render("auth/login", {
                    path:"/login",
                    pageTitle: "Login",
                    errorMessage: "Password  is incorrect",
                    oldInput: {
                        email:email,
                        password:password,
                    },
                    validationErrors:[],
            })
        })
        .catch(err => {
            console.log(err);
            return res.redirect("/login");
        })
    })
    .catch(err => {
        const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
    })
};
exports.getSignUp = (req,res,next) => {
    let message = req.flash("error");
    if(message.length > 0){
        message = message[0];
    } else{
        message = null;
    }
    res.render("auth/signup", {
        path:"/signup",
        pageTitle: "Signup",
        errorMessage: message,
        oldInput: {
            email: "",
            password: "",
            confirmPassword: "",
        },
        validationErrors : [],
    })
};
exports.postSignup = (req,res,next) => {
    const email = req.body.email
    const password = req.body.password;

    const errors = validationResult(req);
    // console.log(errors);
    if(!errors.isEmpty()){
        return res.status(422)
            .render("auth/signup", {
                path:"/signup",
                pageTitle: "Signup",
                errorMessage: errors.array()[0].msg,
                oldInput: {
                    email:email
                    ,password:password,
                    confirmPassword: req.body.confirmPassword,
                },
                validationErrors: errors.array(),
            })
    }
  
    bcrypt.hash(password,12)
        .then(hashPassword => {
            const user = new User({
                email: email,
                password:hashPassword,
                cart: {items:[]}
            });
            return user.save();
        })
        .then(result => {
            transporter.sendMail({
                from: 'nodeCourseComplete@gmail.com',
                to: email,
                subject: 'Sign Up Successful',
                html: "<h1>You have signed up successfully</h1>",
        })
        res.redirect("/login");
    });
}
exports.postLogout = (req,res,next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect("/");
    })
}

exports.getReset = (req,res,next) => {
    let message = req.flash("error");
    if(message.length > 0){
        message = message[0];
    } else{
        message = null;
    }
    res.render("auth/reset", {
        path:"/reset",
        pageTitle: "Reset  Password",
        errorMessage: message,
    })
};

exports.postReset  = (req,res, next) => {
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err);
            return res.redirect("/reset");
        }
        //create token
        const token = buffer.toString('hex');
        User.findOne({email:req.body.email})
        .then(user => {
            if(!user){
                req.flash("error" , "No account with that email found");
                return res.redirect("/reset");
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        })
        .then(result => {
            res.redirect("/");
            transporter.sendMail({
                from: 'nodeCourseComplete@gmail.com',
                to: req.body.email,
                subject: 'Password Reset',
                html: `
                    <p> You requested a password reset </p>
                    <p> Click this <a href="http://localhost:3000/reset/${token}">link </a> to set up a new password
                `,
            });
        })
        .catch(err=> {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
            }
        )
    });
};
exports.getNewPassword = (req,res,next) => {
    const token = req.params.token;
    User.findOne(
        {
            resetToken:token, 
            resetTokenExpiration:{
                $gt:Date.now()
            }
        }
    )
    .then(user => {
        let message = req.flash("error");
        if(message.length > 0){
            message = message[0];
        } else{
            message = null;
        }
        res.render("auth/reset-password", {
        path:"/reset-password",
        pageTitle: "Update Password",
        errorMessage: message,
        passwordToken: token,
        userId: user._id.toString(),
        })
    })
    .catch(err =>{
        const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
    })
    
};

exports.postNewPassword = (req,res,next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    User.findOne({
        resetToken:passwordToken,
        resetTokenExpiration: {$gt:Date.now()},
        _id: userId
    })
    .then(user => {
        resetUser = user;
        return bcrypt.hash(newPassword,12);
    })
    .then(hashedPassword => {
        resetUser.password = hashedPassword;
        resetUser.resetToken=undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    })
    .then(result => {
        res.redirect("/login");
    })
    .catch(err => {
        const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
    })
}