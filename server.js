require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const handlebars = require("express-handlebars");
const cookieSession = require("cookie-session");
const { dataBase } = require("./db");
const db = require("./db");
const cookieParser = require("cookie-parser");
const { log } = require("console");
const app = express();

app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.use(express.static("./views")); // add middleware express.static to serve ./projects folder
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    //console.log("req.method", req.method);
    //console.log("req.url", req.url);
    next();
});

app.use((req, res, next) => {
    //console.log("req.method", req.method);
    //console.log("req.url", req.url);
    next();
});

app.use(cookieParser());


app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        name: "what ever cookie",
    })
);

app.use((req, res, next) => {
    console.log("---------------------");
    console.log("req.url:", req.url);
    console.log("req.method:", req.method);
    console.log("req.session:", req.session);
    console.log("req.session.user_id:", req.session.user_id);
    console.log("---------------------");
    next();
});

app.get("/", (req, res) => {    
    if (req.session.user_id) {
        return res.redirect("/petition");
    } else { 
        return res.redirect("/register");
    }
});

//////GET - REGISTER //////
app.get("/register", (req, res) => {    
    if (req.session.user_id) {
        return res.redirect("/petition");
    } else {
        res.render("register", {
                title: "petition",
            });
//console.log(register, "register");
    }
   
});

////POST - REGISTER////
app.post("/register", (req, res) => {          
    if(req.session.user_id){
        res.redirect("/petition")
    }
    const { firstname, lastname, email, password } = req.body;
console.log("req.body", req.body);
    if (
        firstname === "" ||
        lastname === "" ||
        email === "" ||
        password === ""
    ) {
        
        res.render("register", {
            
            errormessage: "Please fill in the required fields!",
            
        });
        console.log(res, "res");
        return false; 
    }

    db.registerSigner({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password,
    })
        .then((user) => {
            console.log(user);
            req.session.user_id = user.id;
            res.redirect("/petition");
        })
        .catch(function (err) {
            if (err.code === "23505") {
                res.render("register", {
                    errormessage: "Email already existing!",
                });
           // } else {
             ////   res.render("register", {
                //    errormessage: "An error has occoured!",
              //  });
            }
        });
});
    ////////////////// PETITION////
app.get("/petition", (req, res) => {
    console.log("IN GET PETITON", req.session.user_id);
    res.render("petition", {
        title: "petition",
    });
});
    ////////////////// PETITION ///////
app.post("/petition", (req, res) => {
    const { signature } = req.body;

    const user_id = req.session.user_id; //////////////////////////////////////
    
console.log(user_id);

    
    db.insertSigner({
        user_id: user_id,
        signature: signature,
    })
    
        .then((user) => {
            console.log("user in POST petition", user);
            req.session.signed = 1;
            //res.cookie("signed", true, { maxAge: 900000, httpOnly: true });

            res.redirect("/thanks");
        })
        .catch(function (err) {
            console.log(err);
        });
});

app.get("/thanks", (req, res) => {
if (req.session.user_id && req.session.signed){
    db.collectSigners().then((rows) => {
        //inside
        const rowCount = rows.length;
        res.render("thanks", {
            signaturecount: rowCount,
        });
        //inside
    });
}
});



app.get("/signers", (req, res) => {
    db.collectSigners().then((rows) => {
        const signatures = rows.map((row) => {
            let signature = { name: row.firstname, surname: row.lastname };
            //console.log("rows");

            return signature;
        })
        db.getMoreInfo() 
            .then((info) => {
            console.log("MOREINFO: ", info);
            res.render("signe", {
            firstname: age,
            lastname: city,
            email: url,
            })
        })

        res.render("signers", {
            signatures: signatures,
        });
        //console.log("signatures", signatures);
    });
});

    //////////////////     GET - LOGIN    ////
app.get("/login", (req, res) => {
    if (!req.session.user_id) {
    res.render("login");
    } else {
        res.redirect("thanks");
    }
});
  
    //////////////////     POST  LOG-IN    ////
app.post("/login", (req, res) => {          
const { email, password } = req.body;
db.authenticateUser({ email, password})
    .then((user) => { 
     req.session.user_id = user.id; 
     res.redirect("/signers"); 
})      
    .catch((err) => {
            console.log(err);
            res.render("login", {
                message: "יאללה",
                title: "This is very helpful",
            });
        });    
        });


    ///////  GET  MORE_INFORMATION     /////

app.get("/profile", (req, res) => {
    res.render("profile");
        });


    ///////  POST  MORE_INFORMATION     /////

app.post("/profile", (req, res) => {
        if(req.session.user_id){
        res.redirect("/thanks")
        }
        const { age, city, url } = req.body;
        console.log("req.body", req.body);
        if (
        age === "" ||
        city === "" ||
        url === "" 
        ) {
        
        res.render("thanks", {
            
            errormessage: "Please fill in the required fields!",
            
        });
        console.log(res, "res");
        return false; 
    }

db.registerSigner({
        firstname: age,
        lastname: city,
        email: url,
    })
        .then((user) => {
            console.log(user);
            req.session.user_id = user.id;
            res.redirect("/petition");
        })
        .catch(function (err) {
            if (err.code === "23505") {
                res.render("profile", {
                    errormessage: "Email already existing!",
                });
          
            }
        });
});

    ///// LOG OUT ////////
app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});
app.listen(8000, console.log("text listen to port 8000"))