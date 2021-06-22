require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
//const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;
//const encrypt = require('mongoose-encryption');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

//connect to the Database
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Database Connection Sucessful");
  //If connction on then declare a schema
});
//Declare a new Schema
const userSchema = new mongoose.Schema({
  email:String,
  password:String
});
//Plugin the encrypton string to userSchema
//userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields: ['password']});

//Model
const User = new mongoose.model('user', userSchema);

app.route('/')
  .get(function(req, res){
    res.render('home');
  });


app.route('/register')
  .get(function(req, res){
    res.render('register');
  })
  .post(function(req,res){
    bcrypt.genSalt(saltRounds, function(err, salt) {
      bcrypt.hash(req.body.password, salt, function(err, hash) {
          // Store hash in your password DB.
          let newUser = new User({email:req.body.username, password:hash});
          newUser.save(function(err){
            if(!err){
              //go to secrets page
              console.log('Saved User');
              res.render('secrets');
            }else{
              console.log(err);
            }
          });
      });
    });

  });

app.route('/login')
  .get(function(req, res){
    res.render('login');
  })
  .post(function(req,res){
    User.findOne({email:req.body.username}, function(err, doc){
      if(!err){
        if(doc){
          //use bcrypt.compare
          bcrypt.compare(req.body.password, doc.password, function(err, result) {
            console.log(result);
            if(result){
              res.render('secrets');
            }else{
              res.redirect('login');
            }
          });
        }else{
          res.redirect('login');
        }
      }else{
        console.log(err);
      }
    });
  });


// app.route('/secrets')
//   .get(function(req, res){
//     res.render('secrets');
//   });


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
