require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
//Session
app.use(session({
  secret:'Our Little secret',
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

//connect to the Database
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true});
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
//Plugin passport to mongoose userSchema
userSchema.plugin(passportLocalMongoose);//To hash and salt the users and save in mongoDB

//Model
const User = new mongoose.model('user', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.route('/')
  .get(function(req, res){
    res.render('home');
  });


app.route('/register')
  .get(function(req, res){
    res.render('register');
  })
  .post(function(req,res){
    User.register({username:req.body.username}, req.body.password, function(err, user){
      if(err){
        console.log(err);
        res.redirect('/register');
      }else{
        passport.authenticate('local')(req, res, function(){
          res.redirect('/secrets');
        });
      }
    });
  });

app.route('/secrets')
  .get(function(req, res){
    if(req.isAuthenticated()){
        res.render('secrets');
    }else{
      res.redirect('/login');
    }
  });

app.route('/login')
  .get(function(req, res){
    res.render('login');
  })
  .post(function(req,res){
      let user = new User({
        username:req.body.username,
        password:req.body.password
      });
      req.login(user, function(err){
        if(err){
          console.log(err);
        }else{
          passport.authenticate('local')(req, res, function(){
            res.redirect('/secrets');
          })
        }
      })
  });


app.route('/logout')
  .get(function(req, res){
    req.logout();
    res.redirect('/');
  });


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
