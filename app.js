require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const globalSolve = require("./GlobalSolve.js");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
app.use(express.static('public'));
mongoose.connect("mongodb://localhost:27017/dynamicSequenceDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

app.use(session(
  {
    secret: "DSSession",
    resave: false,
    saveUninitialized: false,
  }
));

app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema(
  {
      username : { type : String, required : true},
      email : String,
      password: String,
      googleId : String,
      aligns : Array,
  }
);

const alignSchema = new mongoose.Schema(
  {
    alignmentID : Number,
    firstSequence : String,
    secondSequence : String,
    alignSequence : String,
    alignmentScore : Number,
    alignmentCategory : String,
  }
);

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const alignDB = new mongoose.model("alignDB", alignSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) 
{
  User.findById(id, function(err, user) {
    done(err, user);
  });
}
);

passport.use(new GoogleStrategy(
  {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/secrets");
});

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/registerUtil', function(req, res) {
    res.render('registerUtil');
});

app.post('/register', function(req, res) {
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/registerUtil");
    }
    else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/dashboard/username");
      });
    }
  });
});

app.get('/signUtil', function(req, res) {
    res.render('signUtil');
});

app.post('/sign', function(req, res) {
    const user = new User({
      username: req.body.username,
      password: req.body.password
    });

    req.login(user, function(err){
      if(err){
        console.log(err);
      }
      else{
        passport.authenticate("local");
      }
    })
});

app.get('/sol', function(req, res) {
    res.render('sol');
});

app.post('/solve', function(req, res) {
    const seq_f = req.body.firstSeq;
    const seq_s = req.body.secondSeq;
    const val_m = req.body.matchValue;
    const val_n = req.body.notMatchVal;
    const val_g = req.body.gapValue;
    const solveCategory = req.body.solveCategory;
    if(solveCategory == "globalSolve")
    {
      globalSolve.valMatch = val_m;
      globalSolve.valNotMatch = val_n;
      globalSolve.valGap = val_g;
      let seq_a = globalSolve.solve(seq_f,seq_s);
      let id = process.env.id;
      id = id + 1;
      process.env.id = id;
      res.render('sol', {fval: seq_f, sval: seq_s, val: seq_a, category : "Global Alignment", id : id});
    }
});

app.route('/dashboard/:displayName').get(function(req, res){
    let vals_ = alignDB.findById(User.findById(req.params.displayName));
    let val = User.findById(req.params.displayName).totalValue;
    res.render("dashboard", {name : displayName, totalVal : val.totalVal, globalVal : val.globalVal, localVal : val.localVal, semiLocalVal : val.semiLocalVal, vals : [vals_.alignmentID, vals_.alignmentCategory, vals_.alignmentScore, vals_.alignmentID]});
});

app.get('/index', function(req, res) {
    res.render('index');
});

app.listen(3000);