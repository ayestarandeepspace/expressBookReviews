const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use(
    "/customer",
    session(
        {
            secret:"078DC9C9A5A29BC028E5020C4BBA7D3F558509470BCF27B75F954BC1273B99D1",
            resave: true,
            saveUninitialized: true
        }
    )
);

app.use("/customer/auth/*", function auth(req,res,next){
    // Check if user is logged in and has valid access token
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        // Verify JWT token
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next(); // Proceed to the next middleware
            } else {
                return res.status(401).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(401).json({ message: "User not logged in" });
    }
});

const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
