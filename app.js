
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const md5 = require("md5");

const app = express();
const contacts = [];

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended : true}));

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});


const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  secret: String,

});

//-------------------encrypt password level1----------------------------------//

const secret = process.env.SECRET;

userSchema.plugin(encrypt,{secret:secret, encryptedFields: ["password"] });

//______________________________________________________________________________


const User = new mongoose.model("UserDB",userSchema);


//-------------------------------Home_Root------------------------------------//
app.get("/",function(req,res){
  res.render("home");
});



//______________________________________________________________________________


//---------------------------------Login--------------------------------------//
app.get("/login",function(req,res){

    const name = req.query.name;
    const phno = req.query.phone;
    const email = req.query.email;
    contacts.push(name,phno,email);

    console.log(contacts);

    res.render("home");

});

app.post("/login",function(req,res){
  const username = req.body.username;
  const password = md5(req.body.password);


  User.findOne({email:username},function(err,result){
    if(!err){
      if(result){
        console.log(result.password);
        console.log(password);
        if(result.password === password){

          res.render("secrets");
          console.log("Matched");

        }
        else{

          // console.log("login password :"+password);
          // console.log("Password After: "+result.password);


          console.log("Not Matched");
          res.sendFile(__dirname+"/views/Incorrect.html");

        }
        console.log(result);

      }
      else{
          res.sendFile(__dirname+"/views/notYet.html");
      }

    }
  });

});
//_____________________________________________________________________________


//---------------------------Contacts-----------------------------------------//
app.get("/contacts",function(req,res){
    res.render("contacts", {Mycontacts: contacts});
})

//_____________________________________________________________________________


//-------------------------Register-------------------------------------------//
app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){
  const newUser = new User({
    email : req.body.username,
    password: md5(req.body.password),
    secret: req.body.secret
  });

  newUser.save(function(err){
    if(!err){
      res.render("secrets");
    }
    else{
      console.log(err);
    }
  });

});
//______________________________________________________________________________

//-----------------------------Forget Password----------------------------------

app.get("/forget_password",function(req,res){
  res.render("forget_password");
});

app.post("/forget_password",function(req,res){
  const secretNumber = req.body.secret;
  const userName = req.body.username;
  const newPass = md5(req.body.password);

 console.log("NewPassword "+newPass);

  var myquery = { email: userName };
//  var newvalues = { $set: {password:newPass } };

  User.findOne(myquery, function (err, docs) {
      if (err){
        console.log(err);
      }
      else{
        console.log(err);
        if(docs){
          if(docs.secret == secretNumber){
            console.log("Found my secret");
            const id = docs._id;
            console.log("ID "+id);

            User.findByIdAndUpdate(id, {password:newPass}, function (err, result) {
               if (err){
                   console.log(err);
               }
               else{

                   console.log("Updated password : ", result);
               }
           });

          }
          else{
            console.log("Not found sorry");
          }
        }
      }
      console.log(docs);
  });

  res.render("home");


});

//_____________________________________________________________________________


app.listen(2000,function(){
  console.log("port started at 2000");
});
