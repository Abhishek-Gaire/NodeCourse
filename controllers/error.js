exports.get404 = (req, res, next) => {
    res.status(404).render("404", {path: "",pageTitle: "Page Not Found"});
}

exports.get404 = (req, res, next) => {
    res.status(500)
    .render("500", 
        {   
            path: "/500",
            pageTitle: "Error Occurred"
        });
}