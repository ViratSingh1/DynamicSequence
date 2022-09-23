const express = require("express");
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
app.set('view engine', 'ejs');
mongoose.connect("mongodb://localhost:27017/dynamicSequenceDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email : String,
    password: String,
    googleId: String,
    AlignmentId: String
});

const SeqSchema = new mongoose.Schema ({
    sequenceId: String,
    sequenceValue: String,
});


app.use(session({
  secret: "DS DynamicSequence",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Sequence = new mongoose.model("Sequence", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/DS",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

class solve
{
    constructor(valMatch = 2, valNotMatch = -1, valGap = -1)
    {
        this.valMatch = valMatch;
        this.valNotMatch = valNotMatch;
        this.valGap = valGap;
    }

    localSolve(str, ptr)
    {
        this.str = str;
        this.ptr = ptr;
        this.rows = str.length + 1;
        this.cols = ptr.length + 1;
        localSolveInit();
        localSolveUtil();
        return [solp, solq];
    }

    valScore(scoreArray, rowIndex, colIndex)
    {
        var similarity = (str[rowIndex-1]==ptr[colIndex-1])?valMatch:valNotMatch;
        var scoreDiagonal = scoreArray[rowIndex-1][colIndex-1] + similarity;
        var scoreAbove = scoreArray[rowIndex-1][colIndex] + valGap;
        var scoreLeft = scoreArray[rowIndex][colIndex-1] + valGap;
        return Math.max(scoreDiagonal,scoreAbove,scoreLeft);
    }

    localSolveInit()
    {
        var scoreArray = [];
        for(var i=0;i<rows;i++)
        {
            scoreArray[i] = [];
            for(var j=0;j<cols;j++)
            {
                scoreArray[i].push(0);
            }
        }
        var maxScore = 0;
        var maxRowIndex = rows;
        var maxColIndex = cols;
        for(var i=1;i<rows;i++)
        {
            for(var j=1;j<cols;j++)
            {
                var score = valScore(scoreArray, i, j);
                if(score>maxScore)
                {
                    maxScore = score;
                    maxRowIndex = i;
                    maxColIndex = j;
                }
                scoreArray[i][j] = score;
            }
        }
        this.scoreArray = scoreArray;
        this.initRowIndex = maxRowIndex;
        this.initColIndex = maxColIndex;
    }

    valTrace(rowIndex, colIndex)
    {
        var diagonal = scoreArray[rowIndex-1][colIndex-1];
        var top = scoreArray[rowIndex-1][colIndex];
        var left = scoreArray[rowIndex][colIndex-1];
        if((diagonal>=top)&&(diagonal>=left))
        {
            return (diagonal!=0)?1:0;
        }
        else if((top>diagonal)&&(top>=left))
        {
            return (top!=0)?2:0;
        }
        else if((left>diagonal)&&(left>top))
        {
            return (left!=0)?3:0;
        }
        return 0;
    }

    localSolveUtil()
    {
        var solp = [];
        var solq = [];
        var traceVal = valTrace(initRowIndex, initColIndex);
        var rowIndex = initRowIndex;
        var colIndex = initColIndex;
        while(traceVal!=0)
        {
            if(traceVal==1)
            {
                solp.push(str[rowIndex-1]);
                solq.push(ptr[colIndex-1]);
                rowIndex--;
                colIndex--;
            }
            else if(traceVal==2)
            {
                solp.push(str[rowIndex-1]);
                solq.push('-');
                rowIndex--;
            }
            else
            {
                solp.push('-');
                solq.push(ptr[colIndex-1]);
                colIndex--;
            }
            traceVal = valTrace(rowIndex, colIndex);
        }
        solp.push(str[rowIndex-1]);
        solq.push(ptr[rowIndex-1]);
        this.solp = solp.reverse();
        this.solq = solq.reverse();
    }
}

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/dashboard",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets");
  });

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/sol', function(req, res) {
    res.render('sol', {fval: "", sval: "", val: "", category : "Global Alignment", id : [1,2,3,[1,2,3,4],5]});
});

app.get('/dashboard', function(req, res) {
    var vals = findById(req.body.googleId);
    res.render("dashboard", {name : 'bot', totalVal : 885, globalVal : 81, localVal : 65, semiLocalVal : 21, vals : vals});
});

app.post('/solve', function (req, res) {
    solve s;
    var sol = s.localSolve(req.body.first_seq,req.body.second_seq);
    res.render("solve", {first_seq: sol.solp, second_seq: sol.solq});
})


app.get('/index', function(req, res) {
    res.render('index');
});

app.get("/auth/google/solve",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    res.redirect("/solve");
  });

app.get("/signUtil", function(req, res){
  res.render("login");
});

app.get("/registerUtil", function(req, res){
  res.render("register");
});

app.get("/solve", function(req, res){
  User.find({"solve": {$ne: null}}, function(err, foundUsers){
    if (err){
      console.log(err);
    } else {
      if (foundUsers) {
        res.render("solve", {usersWithSecrets: foundUsers});
      }
    }
  });
});

app.get("/submit", function(req, res){
  if (req.isAuthenticated()){
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});

  User.findById(req.user.id, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.AlignementId = submittedSecret;
        foundUser.save(function(){
          res.redirect("/solve");
        });
      }
    }
  });
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/Dashboard");
      });
    }
  });

});

app.post("/signUtil", function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/Dashboard");
      });
    }
  });

});


app.listen(3000);


