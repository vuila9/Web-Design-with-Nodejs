const pug = require('pug');
const express = require('express');
const session = require('express-session');
const app = express();

let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let db;

app.use(express.static("public"));
app.use(express.static("views"));
app.use(express.json());

app.use(session({
    name: 'ok?',
    secret: "ok",
    resave: true,
    saveUninitialized: false,
}));

app.get(['/', '/home'], (req,res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.send(pug.renderFile("./views/pug/home.pug", {req : req.session}));
});

app.get('/orderform', (req,res) => {
    if (!req.session.loggedin) {
        res.status(404);
        res.send("try to login first");
        return;
    }
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html");
    res.send(pug.renderFile("./views/pug/orderform.pug", {req : req.session}));
});

app.route('/orders')
    .get((req,res) => {
        res.status(404)
        res.send("nothing to see here...")
    })
    .post((req,res) => {
        db.collection("orders").insertOne({
            user: req.body.user,
            restaurant_name : req.body.restaurantName,
            order_list : req.body.order,
            subTotal : req.body.subtotal,
            tax : req.body.tax,
            delivery_fee : req.body.delivery,
            total : req.body.total
        }, function(err, result){
            if (err) throw err;
            res.sendStatus(200);
            return;
        });
    });

app.get('/orders/:oid', (req,res) => {
    let oid;
    try{
        oid = new mongo.ObjectID(req.params.oid);
    }
    catch {
        res.status(404).send("Unknown ID");
        return;
    }
    db.collection('orders').findOne({_id : oid}, function(err, result) {
        if (err) throw err;
        if (result == null) {
            res.status(404);
            res.send(`Order with ID: ${req.params.oid} does not exist`);
            return;
        }
        db.collection('users').findOne({username : result.user}, function(err2, result2) {
            if (err2) throw err2;
            if (result2.privacy && !(result.user == req.session.username)){
                res.status(403);
                res.send("You are not authorized to view the content of this page");
                return;
            }
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/html");
            res.send(pug.renderFile("./views/pug/orderSum.pug", {order : result, user : result2, req : req.session}))
        });           
    });
});

app.get('/users', (req,res) => {
    db.collection('users').find({}).toArray(function (err, result) {
        if (err) throw err;
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.send(pug.renderFile("./views/pug/userList.pug", {users : result, req : req.session}));
    });   
});

app.route('/users/:uid')
    .get((req,res) => {
        let uid;
        try{
            uid = new mongo.ObjectID(req.params.uid);
        }catch{
            res.status(404).send("Unknown ID");
            return;
        }
        db.collection('users').findOne({_id : uid}, function(err, result) {
            if (err) throw err;
            if (!result){
                res.status(404);
                res.send(`User with ID: ${req.params.uid} does not exist`);
                return;
            }
            if (result.privacy && !(result.username == req.session.username)) {
                res.status(403);
                res.send("You are not authorized to view the content of this page")
                return;
            }
            db.collection('orders').find({user : result.username}).toArray(function (err2, result2) {
                if (err2) throw err2;
                res.statusCode = 200;
                res.setHeader("Content-Tyte", "text/html");
                res.send(pug.renderFile("./views/pug/userPage.pug", {user : result, orders : result2, req : req.session}))
            });
        });
    })
    .put((req,res) => {
        let uid;
        try{
            uid = new mongo.ObjectID(req.params.uid);
        }catch{
            res.status(404).send("Unknown ID");
            return;
        }      
        db.collection('users').updateOne({_id : uid}, {$set: {privacy : (req.body.signal === 'true')}}, function (err, result) {
            if (err) throw err;
            res.sendStatus(201);
            return
        });
    });

app.get('/user', (req,res) => {
    let username = decodeURI(req.query.name).toLowerCase();
    db.collection('users').find({username : {$regex: username}}).toArray(function(err, result) {
        if (err) throw err;
        if (!result) {
            result = "";
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html");
        res.send(pug.renderFile("./views/pug/userList.pug", {users : result, req : req.session}));
    });
})

app.route('/register')
    .get((req,res) => {
        let users;
        if (req.session.loggedin) {
            res.status(404);
            res.send("You are already logged in, logout if you want to create new account");
            return;
        }
        db.collection('users').distinct("username", function (err, result) {
            if(err) throw err       
            users = result;
            res.statusCode = 200;           
            res.setHeader("Content-Type", "text/html");
            res.send(pug.renderFile("./views/pug/register.pug", {users: users}));
        });       
    })
    .post((req,res) => {
        let username = req.body.username;
        let password = req.body.password;
        db.collection('users').insertOne({username: username, password: password, privacy: false}, function (err, result){
            if (err) throw err;
            res.sendStatus(201);
            return;
        });
    });

app.get('/logout', (req,res) => {
    if (req.session.loggedin) {
        req.session.destroy();
        res.redirect("/home");
        return;
    }
    res.status(404);
    res.send("what is you doing good sir/madam?");
    return
});

app.route('/login')
    .get((req,res) => {
        if (req.session.loggedin) {
            res.status(404);
            res.send("you are already logged in...");
            return
        }
        else {
            res.status(404);
            res.send("use the login button, don't be like this...");
            return;
        }
    })
    .post((req,res) => {
        let username = req.body.user;
        let password = req.body.pass;
        db.collection('users').findOne({username : username, password : password}, function(err, result){
            if (err) throw err;
            if (result == null) {
                res.status(401);
                res.send("username does not exist or password is wrong");
                return;
            }
            req.session.loggedin = true;
            req.session.username = username;
            req.session._id = result._id;
            res.sendStatus(201);
            return;
        });
    });

MongoClient.connect("mongodb://localhost:27017/", function(err, client) {
    if(err) throw err;

    //Get the a4 database
    db = client.db('a4');

    // Start server once Mongo is initialized
    app.listen(3000);
    console.log("Listening on port 3000");
});
