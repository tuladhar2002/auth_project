//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const encryption = require("mongoose-encryption");
dotenv.config();



const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.set(`view engine`, `ejs`);

mongoose.connect(process.env.MONGO_URL);

const userDbSchema = new mongoose.Schema({
   email: String,
   password: String,
});

const secret = "somelongstringidontcareabout";
userDbSchema.plugin(encryption, {secret: secret, encryptedFields: ["password"]});

const User = mongoose.model("User", userDbSchema);


app.get("/",(req,res)=>{
    res.render("home");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.post("/register", async(req,res)=>{
    const username = req.body.username;
    const foundUser = await User.findOne({email: username}).exec();
    if(foundUser){
        res.render("login",{
            invalid_login: "Username Already Taken. Try logging in.."
        })
    }else{
        try{
            const newUser = new User({
                email: req.body.username,
                password:req.body.password,
            });
        
            newUser.save()
        
            res.redirect("/login");
        }catch(err){
            console.log(err);
        };
    };
    
    
});

app.post("/login", async(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;

    try{
        const foundUser = await User.findOne({email: username}).exec();
       if(foundUser.password === password){
            res.render("secrets");
        }else{
            res.render("login",{
            invalid_login: "Invalid Username or Password",
            });
        };
    }catch(err){
        console.log(err);
    };


});

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
});