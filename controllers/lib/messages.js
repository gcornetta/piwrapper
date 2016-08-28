var i18n = require('i18n');

var validationMsg = {
firstname                  : i18n.__('w_00053'), 
lastname                   : i18n.__('w_00054'),
emailRequired              : i18n.__('w_00055'),
emailNotValid              : i18n.__('w_00056'),
username                   : i18n.__('w_00057'),
password                   : i18n.__('w_00058'),
passwordMatch              : i18n.__('w_00059'),
vendor			   : i18n.__('w_00097'),
type                       : i18n.__('w_00098'),
name			   : i18n.__('w_00099'),
adcVendor		   : i18n.__('w_00100'),
adcDevice		   : i18n.__('w_00101'),
machineMismatch            : i18n.__('w_00102'),
adcMismatch                : i18n.__('w_00103'),
userRoleRequired           : i18n.__('w_00113'),
passwordConfirm            : i18n.__('w_00114')
};

exports.validationMsg = validationMsg;  

var userMsg = {
superuserExists            : i18n.__('w_00060'), 
loginSuccess               : i18n.__('w_00061')
};

exports.userMsg = userMsg;  

var passwordMsg = {
username                   : i18n.__('w_00057'), 
userNotExists              : i18n.__('w_00062'),
dbAccessError              : i18n.__('w_00063'),
contact                    : i18n.__('w_00064'),
passwordSent               : i18n.__('w_00065'),
checkMail                  : i18n.__('w_00066')
};

exports.passwordMsg = passwordMsg;


var logoutMsg = {
logout                     : i18n.__('w_00069')
};

exports.logoutMsg = logoutMsg;

var welcomeMsg = {
welcome                     : i18n.__('w_00085'),
lastLog                     : i18n.__('w_00086'),
hello                       : i18n.__('w_00095'),
wizard                      : i18n.__('w_00096')
};

exports.welcomeMsg = welcomeMsg;

var authorizationMsg = {
missingCredentials          : i18n.__('w_00093')
};

exports.authorizationMsg = authorizationMsg;