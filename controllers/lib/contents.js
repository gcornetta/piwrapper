var i18n = require('i18n');

var regFormText = {
title                     : i18n.__('w_00001'), 
headerTitle               : i18n.__('w_00002'),
headerSubtitle            : i18n.__('w_00003'),
bodyTitle_1               : i18n.__('w_00004'),
bodyTitle_2               : i18n.__('w_00005'),
bodyTitle_3               : i18n.__('w_00006'),
bodyDescrip_1             : i18n.__('w_00007'),
bodyDescrip_2             : i18n.__('w_00008'),
bodyDescrip_3             : i18n.__('w_00009'),
namePlaceholderText       : i18n.__('w_00010'),
surnamePlaceholderText    : i18n.__('w_00011'),
emailPlaceholderText      : i18n.__('w_00012'),
userNamePlaceholderText   : i18n.__('w_00013'),
passwordPlaceholderText   : i18n.__('w_00014'),
passConfirmPlaceholderText: i18n.__('w_00015'),
submitButtonText          : i18n.__('w_00016'),
loginButtonText           : i18n.__('w_00017')
};

exports.regFormText = regFormText; 


var loginFormText = {
title                     : i18n.__('w_00001'),
homePageLink              : i18n.__('w_00018'),
loginHeader               : i18n.__('w_00019'),
userPlaceholder           : {label: i18n.__('w_00020'), text: i18n.__('w_00021')},
passwordPlaceholder       : {label: i18n.__('w_00022'), text: i18n.__('w_00022')},
submitButtonText          : i18n.__('w_00023'),
forgotPasswordLink        : i18n.__('w_00024'),
forgotPasswordTooltip     : i18n.__('w_00025'),
gobackTologinTooltip      : i18n.__('w_00026'),
requestFormHeaderText     : i18n.__('w_00027'),
passwordRequestButton     : i18n.__('w_00028')     
};

exports.loginFormText = loginFormText; 

var dashboardText = {
title                     : i18n.__('w_00001'),
headerTitle               : i18n.__('w_00002'),
headerSubtitle            : i18n.__('w_00029'),
fabLabName                : i18n.__('w_00002'),
fabLabText                : i18n.__('w_00030'),
sideBar		          : {user : {editProfile : i18n.__('w_00031'), settings: i18n.__('w_00032')},
                             wizard : i18n.__('w_00033'),
                             machine : i18n.__('w_00104'),
                             system : {title: i18n.__('w_00034'), overview: i18n.__('w_00035'), stats: i18n.__('w_00036')},
                             tools     : {title: i18n.__('w_00037'), userManag : i18n.__('w_00038'), sysManag : i18n.__('w_00039'), sysLog : i18n.__('w_00040')},
                             workload : i18n.__('w_00041')
			    },
terminalPanelTitle        : i18n.__('w_00042'),
cpuPanelTitle             : i18n.__('w_00043'),
cpuUptime                 : i18n.__('w_00044') 
};

exports.dashboardText = dashboardText; 


var profileText = {
editProfile                     : i18n.__('w_00045'),
userName                        : i18n.__('w_00046'),
role                            : i18n.__('w_00047'),
email                           : i18n.__('w_00048'),
firstName                       : i18n.__('w_00049'),
lastName                        : i18n.__('w_00050'),
updateProfile                   : i18n.__('w_00051'),
uploadPhoto                     : i18n.__('w_00052') 
};

exports.profileText = profileText;


var sysInfoText = {
parameter                 : i18n.__('w_00070'),
value                     : i18n.__('w_00071'),
arch                      : i18n.__('w_00072'),
numCores                  : i18n.__('w_00073'),
clk                       : i18n.__('w_00074'),
avgClk                    : i18n.__('w_00075'),
osType                    : i18n.__('w_00076'),
release                   : i18n.__('w_00077'),
totMem                    : i18n.__('w_00078'),
freeMem                   : i18n.__('w_00079'),
avgLoad                   : i18n.__('w_00080'),
coreLabel                 : i18n.__('w_00081'),
timeWin1                  : i18n.__('w_00082'),
timeWin2                  : i18n.__('w_00083'),
timeWin3                  : i18n.__('w_00084')
};

exports.sysInfoText = sysInfoText;

var panelNames = {
dashboard                : i18n.__('w_00087'),
profile                  : i18n.__('w_00088'),
wizard                   : i18n.__('w_00094'),
settings                 : i18n.__('w_00105'),
logs                     : i18n.__('w_00115')
};

exports.panelNames = panelNames;


var userRoles = {
superAdmin             : i18n.__('w_00089'),
admin                  : i18n.__('w_00090')
};

exports.userRoles = userRoles;

var settingsText = { 
editSettings		: i18n.__('w_00106'),
machineName		: i18n.__('w_00107'),
machineType		: i18n.__('w_00108'),
machineVendor		: i18n.__('w_00109'),
adcVendor		: i18n.__('w_00110'),
adcDevice		: i18n.__('w_00111'),
updateSettings		: i18n.__('w_00112')
};

exports.settingsText = settingsText; 