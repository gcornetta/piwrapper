var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var generator = require('generate-password');
var wsClient = require ('../helpers/websockets/ws-client');

var User = require('../models/user');
var pageContent = require('./helpers/contents');

var regFormText = pageContent.regFormText;
var loginFormText = pageContent.loginFormText;

var registerPage = {title: regFormText.title,
                       navBarTitle: regFormText.navBarTitle,
                       pageHeader: {
                         title: regFormText.headerTitle,
			 subtitle: regFormText.headerSubtitle    				
                       },
                       pageBody:{
                         title_1: regFormText.bodyTitle_1,
                         title_2: regFormText.bodyTitle_2,
                         title_3: regFormText.bodyTitle_3,
                         description_1: regFormText.bodyDescrip_1,
                         description_2: regFormText.bodyDescrip_2,
                         description_3: regFormText.bodyDescrip_3
                       },
                       placeHolders: [{type: "text", name: "firstname", text:regFormText.namePlaceholderText},
                                      {type: "text", name: "lastname", text:regFormText.surnamePlaceholderText},
                                      {type:"email", name: "email", text:regFormText.emailPlaceholderText},
                                      {type: "text", name: "username", text:regFormText.userNamePlaceholderText},
                                      {type:"password", name: "password", text:regFormText.passwordPlaceholderText},
                                      {type:"password",name: "confirmpwd", text:regFormText.passConfirmPlaceholderText}
                                     ],
                       submitButton: regFormText.submitButtonText,
                       loginButton: regFormText.loginButtonText,
                       errors: null,
                       flashSuccess: null, //for future use
                       flashError: null
	              };


var loginPage = {title: loginFormText.title,
                       navBarTitle: loginFormText.navBarTitle,
                       homePageLink: loginFormText.homePageLink,
                       loginHeader : loginFormText.loginHeader, 
                       placeHolders: [{label: loginFormText.userPlaceholder.label, type: "text", name: "username", text: loginFormText.userPlaceholder.text},
                                      {label: loginFormText.passwordPlaceholder.label, type: "password", name: "password", text: loginFormText.passwordPlaceholder.text}
                                     ],
                       submitButtonText: loginFormText.submitButtonText,
                       forgotPasswordLink: loginFormText.forgotPasswordLink,
                       forgotPasswordTooltip: loginFormText.forgotPasswordTooltip,
		                   gobackTologinTooltip: loginFormText.gobackTologinTooltip,
                       requestFormHeaderText: loginFormText.requestFormHeaderText,
                       passwordRequestButton: loginFormText.passwordRequestButton,
                       errors: null,
                       flashSuccess: null,
                       flashError: null		 
                       };

var dashboardPage = {title: regFormText.title,
                       navBarTitle: regFormText.navBarTitle,
                       pageHeader: {
                         title: regFormText.headerTitle,
			 subtitle: regFormText.headerSubtitle    				
                       }
                    }

// Get Registration Page
router.get('/', function(req, res){
        
        //clears previous validation errors from registerPage
        registerPage.errors = null; 
	
        //render the registration page
        res.render('register', registerPage);
        
        //reset the flash errors in RegisterPage Object
        registerPage.flashError = null;
});

router.get('/dashboard', isLoggedIn, function(req, res){
	res.render('dashboard', dashboardPage);
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/login');
	}
}

// Login
router.get('/login', function(req, res){
         //clears previous validation errors from registerPage
        loginPage.errors = null; 

        //render the login page
        res.render('login', loginPage);

        //clear the messages from the loginPage object
        loginPage.flashSuccess = null;
        loginPage.flashError = null;
});

// Register User
router.post('/', function(req, res){
	var firstname = req.body.firstname;
        var lastname = req.body.lastname;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var confirmpwd = req.body.confirmpwd;

	// Validation
	req.checkBody('firstname', 'First name is required').notEmpty();
        req.checkBody('lastname', 'Last name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('confirmpwd', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors){
                registerPage.errors = errors;
                res.render('register', registerPage);
	} else {
		var newUser = new User({
			firstname: firstname,
                        lastname: lastname,
			email:email,
			username: username,
                        issuperuser: true		
		});
                
                User.checkIfSuperuserExists(function(err, user) {
                    if(err) throw err;
                    if (user != null){
                       req.flash('error_msg', 'Superuser exists. Ask fab lab admin to create an account');
                       //retrieve messages from session
                       var flashError = req.flash('error_msg')[0];                       
                      //save messages in registerPage object
                       registerPage.flashError = flashError;
                       //clear flash messages from session
                       req.session.flash = [];
                       
                       res.redirect('/');
                    } else {
			User.createUser(newUser, password, function(err, user){
			   if(err) throw err;
			   console.log(user);
		        });
		        req.flash('success_msg', 'You are registered and can now login');
                        var flashSuccess = req.flash('success_msg')[0];
                        registerPage.flashSuccess = flashSuccess;
                        req.session.flash = []; //just for security since a flash read pulls out all the elements
		        res.redirect('/login');
                    } 
                });	
	}
});

passport.use(new LocalStrategy({
    passReqToCallback: true 
  },
  function(req, username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
                //this is necessary because for some reason 'done' clears the flash object in the session
                req.flash('error_msg', 'Unknown User');
                var flashError = req.flash('error_msg')[0];                       
                loginPage.flashError = flashError;
   		return done(null, false);
   	}
        
   	User.comparePassword(user, password, function(err, isMatch){
   		if(err) throw err;
                
   		if(isMatch){
   			return done(null, user);
   		} else {
                        req.flash('error_msg', 'Invalid password');
                        var flashError = req.flash('error_msg')[0];                       
                        loginPage.flashError = flashError;   			
                        return done(null, false);
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
            passport.authenticate('local', {successRedirect:'/dashboard', failureRedirect:'/login', failureFlash: true}),
            function(req, res) {
               res.redirect('/dashboard');
            });

router.post('/login/request/',function(req, res) {
    var username = req.body.username;
    var email;

    req.checkBody('username', 'Username is required').notEmpty();
    
    var errors = req.validationErrors();
    
    if(errors){
                loginPage.errors = errors;
                res.render('login', loginPage);
	} else {
            User.getUserByUsername(username, function(err, user){
               if(err) throw err;
                if(!user){
                   req.flash('error_msg', 'User does not exists. Check spelling and resubmit form');
                   var flashError = req.flash('error_msg')[0];                       
                   loginPage.flashError = flashError;
                   req.session.flash = [];
                } else {
                   email = user.email; //save user email
                   var newPassword = generator.generate({ //generate a new password
                      length: 8,
                      symbols: true,
                      uppercase: true,
                      excludeSimilarCharacters: true,
                      numbers: true
                   });
                   var msg = "{\"username:\" " + "\"" + (username).toString()+ "\"" + " \"password:\" " + "\"" + (newPassword).toString()+"\"}";

                   //use the following code to convert the msg in a JSON object on the server side 
                   //var json = JSON.parse(msg);
                   
                   wsClient.wsSendMsg (process.env.GATEWAY, 'new_password_request', msg, function(err, msg, sendOK){
                      User.updatePassword(username, newPassword, function (err, updateOK){
                         if (err) throw err;
                         if(!updateOK){
                            req.flash('error_msg', 'Something went wrong with DB access. Contact Fab Lab administrator.');
                            var flashError = req.flash('error_msg')[0];                       
                            loginPage.flashError = flashError;
                         }
                      });
                      if (err) throw err; 
                      if(!sendOK){
                        var errorResponse = msg.toString() + " Contact Fab Lab administrator.";  
                        req.flash('error_msg', errorResponse);
                        var flashError = req.flash('error_msg')[0];                       
                        loginPage.flashError = flashError;
                      } else {
                         var successResponse = msg.toString() + " A new password has been sent to " + (email).toString() + ". Check your mail inbox."; 
                         req.flash('success_msg', successResponse);
                         var flashSuccess = req.flash('success_msg')[0];                       
                         loginPage.flashSuccess = flashSuccess;
                      }
                   });                                         
                }
              res.redirect('/login'); 
              });
        } 
  });
 

router.get('/logout', function(req, res){
	req.logout();

	req.flash('success_msg', 'You have successfully logged out');
        var flashSuccess = req.flash('success_msg')[0];                       
        loginPage.flashSuccess = flashSuccess;
        req.session.flash = [];

	res.redirect('/login');
});

module.exports = router;