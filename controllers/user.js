var generator = require('generate-password');
var mongoose = require('mongoose');
var wsClient = require ('../lib/websockets/ws-client');
var User = require('../models/user');
var winston = require('winston');

var pageContent = require('./lib/contents');
var systemMessages = require('./lib/messages');

var regFormText = pageContent.regFormText;
var loginFormText = pageContent.loginFormText;
var sysMsg = systemMessages.validationMsg;
var usrMsg = systemMessages.userMsg;
var pwdMsg = systemMessages.passwordMsg;
var logMsg = systemMessages.logoutMsg;

var registerPage = {title: regFormText.title,                       
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
                       flashSuccess: null,
                       flashError: null
	              };


var loginPage = {title: loginFormText.title,
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


module.exports.registration = function(req, res){
        //clears previous validation errors from registerPage
        registerPage.errors = null; 
	
        //render the registration page
        res.render('register', registerPage);
        
        //reset the flash errors in RegisterPage Object
        registerPage.flashError = null;
}

module.exports.login = function(req, res){
         //clear previous validation errors from registerPage
        loginPage.errors = null; 
         
        //update login page with login errors stored in the session object 
        loginPage.flashError = req.session.error_msg;
        req.session.error_msg = null;
 
        //render the login page
        res.render('login', loginPage);

        //clear the messages from the loginPage object
        loginPage.flashSuccess = null;
        loginPage.flashError = null;
}

module.exports.registrationForm = function(req, res){
	var firstname = req.body.firstname;
        var lastname = req.body.lastname;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var confirmpwd = req.body.confirmpwd;

	// Validation
	req.checkBody('firstname', sysMsg.firstname).notEmpty();
        req.checkBody('lastname', sysMsg.lastname).notEmpty();
	req.checkBody('email', sysMsg.emailRequired).notEmpty();
	req.checkBody('email', sysMsg.emailNotValid).isEmail();
	req.checkBody('username', sysMsg.username).notEmpty();
	req.checkBody('password', sysMsg.password).notEmpty();
	req.checkBody('confirmpwd', sysMsg.passwordMatch).equals(req.body.password);

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
                        pathtophoto: null,
                        lastlogged: Date.now(),
                        issuperuser: true		
		});
                
                User.checkIfSuperuserExists(function(err, user) {
                    if(err) throw err;
                    if (user != null){
                       req.flash('error_msg', usrMsg.superuserExists);
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
			   winston.info('@user.registration: superadministrator successfully created');
		        });
		        req.flash('success_msg', usrMsg.loginSuccess);
                        var flashSuccess = req.flash('success_msg')[0];
                        registerPage.flashSuccess = flashSuccess;
                        req.session.flash = []; //just for security since a flash read pulls out all the elements
		        res.redirect('/login');
                    } 
                });	
	}
}

module.exports.passwordRequest = function(req, res) {
    var username = req.body.username;
    var email;

    req.checkBody('username', pwdMsg.username).notEmpty();
    
    var errors = req.validationErrors();
    
    if(errors){
                loginPage.errors = errors;
                res.render('login', loginPage);
	} else {
            User.getUserByUsername(username, function(err, user){
               if(err) throw err;
                if(!user){
                   req.flash('error_msg', pwdMsg.userNotExists);
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
                            req.flash('error_msg', pwdMsg.dbAccessError);
                            var flashError = req.flash('error_msg')[0];                       
                            loginPage.flashError = flashError;
                         }
                      });
                      if (err) throw err; 
                      if(!sendOK){
                        var errorResponse = msg + pwdMsg.contact;  
                        req.flash('error_msg', errorResponse);
                        var flashError = req.flash('error_msg')[0];                       
                        loginPage.flashError = flashError;
                      } else {
                         var successResponse = msg + pwdMsg.passwordSent + (email).toString() + pwdMsg.checkMail; 
                         req.flash('success_msg', successResponse);
                         var flashSuccess = req.flash('success_msg')[0];                       
                         loginPage.flashSuccess = flashSuccess;
                      }
                   });                                         
                }
              res.redirect('/login'); 
              });
        } 
  }

module.exports.logout = function(req, res){
	User.updateLastLogByUsername(req.user.username, function(err, result){
            if(err) throw (err);
            if(result){
             winston.info('@user.logout: DB successfully updated with log date');
            }
        });
        var username = req.user.username;
        req.logout();
        winston.log('info', '@user.logout: User %s logged out', username);
	req.flash('success_msg', logMsg.logout);
        var flashSuccess = req.flash('success_msg')[0];                       
        loginPage.flashSuccess = flashSuccess;
        req.session.flash = [];

	res.redirect('/login');
}