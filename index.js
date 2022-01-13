/*  EXPRESS */
const express = require('express');
const app = express();

var bodyParser = require('body-parser');  
var urlencodedParser = bodyParser.urlencoded({ extended: false })  


var tasks;
const session = require('express-session');
var MongoClient = require('mongodb').MongoClient;
var url = "tour connection url";
app.set('view engine', 'ejs');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

app.get('/', function(req, res) {
  res.render('pages/login');
});

const port = process.env.PORT || 3000;
app.listen(port , () => console.log('App listening on port ' + port));


var passport = require('passport');
var userProfile;
 
app.use(passport.initialize());
app.use(passport.session());
 
app.get('/success', (req, res) => {
  //res.render('pages/success', {user: userProfile});
    MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  dbo.collection("tasks").find({user_id:userProfile.id}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
	tasks=result;
    db.close();
	res.render('pages/notes', {user: userProfile,tasks:tasks});
	console.log(userProfile.displayName);
  });
});
});
app.post('/success',urlencodedParser, (req, res) => {
  //res.render('pages/success', {user: userProfile});
  MongoClient.connect(url, function(err, db) {
		  if (err) throw err;
		  var dbo = db.db("mydb");
		  var myobj = { user_id: userProfile.id, text:req.body.text};
		  dbo.collection("tasks").insertOne(myobj, function(err, data) {
			if (err) throw err;
			console.log(userProfile);
			console.log("1 document inserted");
			db.close();
			res.redirect("/success");
		  });
		});
});
app.get('/delete',urlencodedParser, (req, res) => {
  //res.render('pages/success', {user: userProfile});
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
 
  dbo.collection("tasks").deleteOne({id:req.body.id}, function(err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    db.close();
    res.redirect('/success');
  });
});
});

app.get('/error', (req, res) => res.send("error logging in"));
 
passport.serializeUser(function(user, cb) {
  cb(null, user);
});
 
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


/*  Google AUTH  */
 
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = '118028452917-euet4ah5nhl5ga1a8tfc9qq2lovqa4ft.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "https://replyapp2.dhruvpatil.repl.co/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));



app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/success');
  });