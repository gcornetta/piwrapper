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
deviceURI		   : i18n.__('w_00253'),
machineMismatch            : i18n.__('w_00102'),
adcMismatch                : i18n.__('w_00103'),
userRoleRequired           : i18n.__('w_00113'),
passwordConfirm            : i18n.__('w_00114'),
process                    : i18n.__('w_00147'),
material		   : i18n.__('w_00148'),
diameter		   : i18n.__('w_00149'),
offsets			   : i18n.__('w_00150'),
overlap			   : i18n.__('w_00151'),
error			   : i18n.__('w_00152'), 
threshold		   : i18n.__('w_00153'),
merge			   : i18n.__('w_00154'),
order			   : i18n.__('w_00155'),
sequence		   : i18n.__('w_00156'),
power			   : i18n.__('w_00157'),
speed			   : i18n.__('w_00158'),
rate			   : i18n.__('w_00159'),
xCoord			   : i18n.__('w_00160'),
yCoord			   : i18n.__('w_00161'),
path			   : i18n.__('w_00162'),
spotSize		   : i18n.__('w_00180'),
minSpotsize		   : i18n.__('w_00181'),
horSpotspace		   : i18n.__('w_00182'),
verSpotspace		   : i18n.__('w_00183'),
pointSpot		   : i18n.__('w_00184'),
machine			   : i18n.__('w_00185'),
x			       : i18n.__('w_00225'),
y			       : i18n.__('w_00226'),
z			       : i18n.__('w_00227'),
zjog			   : i18n.__('w_00228'),
machines		   : i18n.__('w_00229'),
origin			   : i18n.__('w_00241'),
pcbFinishing	   : i18n.__('w_00230'),
waxFinishing	   : i18n.__('w_00230'),
thickness		   : i18n.__('w_00231'),
switchSort		   : i18n.__('w_00232'),
direction		   : i18n.__('w_00233'),
cutDepth		   : i18n.__('w_00234'),
bottomZ			   : i18n.__('w_00235'),
bottomIntensity	   : i18n.__('w_00236'),
topZ			   : i18n.__('w_00237'),
topIntensity	   : i18n.__('w_00238'),
xz			       : i18n.__('w_00239'),
yz			       : i18n.__('w_00240'),
type			   : i18n.__('w_00250')

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