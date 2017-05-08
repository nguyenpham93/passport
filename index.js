var app = require('express')();
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
var nunjucks = require('nunjucks');

const elas = require("./elastic/index");
const moment = require("moment");
const shortid = require("shortid");
const async = require("async");
const Promise = require("bluebird");




app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

nunjucks.configure('views',{
    autoescape: true
});

app.set('view engine','html');

app.engine('html', nunjucks.render);

app.use(session({
    //set cookie expiration in ms
//   cookie: { maxAge: (2000*3000) },
  secret : "secret",
  unset: 'destroy',
  saveUninitialized: false,
  resave: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

//Cấu hình 1 kịch bản cho thằng Passport và thiết lập 2 hàm serializeUser, deserializeUser

passport.deserializeUser ( function ( id, done ) {
    elas.search ( 'passport', 'users', id)
    .then ( user => {
        user = user[0];
        done (null, user);
    },
    error => {
        console.log (error);
    });
});

passport.use ( new LocalStrategy ({
    usernameField: 'email',
    passwordField: 'password',
  },
    function ( email, password, done ) {
        elas.search ( 'passport', 'users', email)
        .then ( user => {
            user = user[0];
            bcrypt.compare (password, user['password'], ( err, result ) => {
                if (err) { return done (err); }
                if (!result) {
                    return done ( null, false, { message : 'Incorrect Email or Password' });
                } 
                return done ( null, user );
            });
        },
        error => {
            return done (error);
        });
    }
))

app.post ('/register', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    checkEmail ( email )
    .then ( existed => {
        let status = '';
        if ( !existed ){
            console.log('email available');
            //email available
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash( password, salt, function(err, hash) {
                    let user = {
                        id : shortid.generate(),
                        email : email,
                        password : hash,
                        date : moment().format("DD/MM/YYYY")
                    }
                    elas.insertDocument ('passport', 'users', user)
                    .then ( data => {
                        console.log("Register succeed");
                        status = 'Register succeed';
                    });
                });
            });
        } else {
            status = "Email Existed";
        }
        res.render('index', {'status' : status});
    });
});

//TODO : check email existed
// return true if existed
// return false if not existed
function checkEmail ( email ) {
    return new Promise ( (resolve, reject) => {
        elas.searchAll ( 'passport', 'users')
        .then ( (data) => {
            let n = data.length;
            for (let i = 0; i < n; i++) {
                if (email === data[i]['email']) {
                    console.log ('email exist');
                    resolve (true);
                }
            }
            resolve (false);
        });
    });
}

app.get ("/login", (req, res) => {
    res.render ('notlogin');
});

app.get ('/', (req, res) => {
    res.render('index');
});

app.get ('/logined' , (req, res) => {
    // console.log(req.user);
    res.render('logined');
});

app.post ('/test', (req, res)=>{
    if (req.isAuthenticated()) {
        console.log ('da login');
    } else{
        console.log ('chua login');
    }
    res.render ('page3', {'user' : req.user});
});

app.post ('/logout', (req, res)=>{
    console.log(req.session);
     req.logOut();
    //   req.session = null;
      console.log(req.session);
    // req.session.destroy(function (err) {
    //     res.redirect('/'); //Inside a callback… bulletproof!
    // });
    res.redirect('/');
});

app.post ("/login", passport.authenticate('local', { successRedirect: '/logined',failureRedirect: '/login' }));

app.listen(3000);