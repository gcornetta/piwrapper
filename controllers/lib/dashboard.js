var pageContent = require('./contents');
var infoMsg = require('./messages');

var dashboardText = pageContent.dashboardText;
var profileText   = pageContent.profileText;
var settingsText  = pageContent.settingsText;

var infoText      = pageContent.sysInfoText;
exports.infoText  = infoText;

var laserPanelText   = pageContent.laserPanelText;
var vinylPanelText   = pageContent.vinylPanelText;
var millingPanelText = pageContent.millingPanelText;


var dashboardPage = {title: dashboardText.title,
                       pageHeader: {
                         title: dashboardText.headerTitle,
			 subtitle: dashboardText.headerSubtitle    				
                       },
                       fabLabName: dashboardText.fabLabName,
                       fabLabText: dashboardText.fabLabText,
                       sideBar   : dashboardText.sideBar,
                       userProfile : {
                          editProfile : profileText.editProfile,
                          userName : profileText.userName,
                          role : profileText.role,
                          email : profileText.email,
                          firstName : profileText.firstName,
                          lastName : profileText.lastName,
                          updateProfile : profileText.updateProfile,
                          uploadPhoto : profileText.uploadPhoto     
		       },
                       machineSettings : {
                          editSettings : settingsText.editSettings,
                          machineName : settingsText.machineName,
                          machineType : settingsText.machineType, 
                          machineVendor : settingsText.machineVendor,
                          adcVendor : settingsText.adcVendor,
                          adcDevice : settingsText.adcDevice,
                          updateSettings : settingsText.updateSettings 
		       },
                       currentPanelRoute : {},
                       currentPanelName : {},
                       machinePanelRoute : {},
		       flashSuccess : false, 
                       uploadSuccess : false,
                       flashWelcome : null,
                       flashUpload : null,
                       displayWelcome : true,
                       displayTerminal : true, 
                       displayProfile : false,
                       displayWizard : false,
                       displaySettings : false,
                       displayLogs : false,
                       displayControl : false,
                       machineConfigured : false,
		       displaySidebarMenu : null,
                       profile : {},
                       machine : {},
                       pathToPhoto : {},
                       lastLoggedOn : {},
                       terminalPanelTitle : dashboardText.terminalPanelTitle,
                       cpuPanelTitle : dashboardText.cpuPanelTitle,
                       cpuUptime : dashboardText.cpuUptime,
		       sysInfoTable : { header : {col1 : infoText.parameter, col2 : infoText.value},
					rows : [{label : 'Architecture', translation: infoText.arch, value : null},	
						{label : 'Number of cores', translation: infoText.numCores, value : null},
						{label : 'Clock frequency', translation: infoText.clk, value : []},
						{label : 'Average clock frequency', translation: infoText.avgClk, value : null},
						{label : 'OS Type', translation: infoText.osType, value : null},
						{label : 'Release', translation: infoText.release, value : null},
						{label : 'Total memory', translation: infoText.totMem, value : null},
						{label : 'Free memory', translation: infoText.freeMem, value : null},
						{label : 'Average load', translation: infoText.avgLoad, value : [{label : infoText.timeWin1, value : null},
                                             					                   {label : infoText.timeWin2, value : null},
                                             					                   {label : infoText.timeWin3, value : null}
                                            					                  ]
                                    	        }
     					       ]
					},   
		      wizardPage : {
					samplingDevices : [{vendor : 'Texas Instruments', deviceList : ['ADS 1015', 'ADS 1115']}],
        				machines        : [{label: 'Laser cutters', type : 'Laser cutter' , vendors : ['Epilog', 'GCC', 'Trotec']},
                           			   	   {label: 'Vinyl cutters', type : 'Vinyl cutter' , vendors : ['Roland']},
			   			   	   {label: 'Milling machines', type : 'Milling machine' , vendors : ['Roland', 'Othermachine']},
                           			   	   {label: 'Micromachining', type : 'Laser micromachining' , vendors : ['Oxford']}
						  	  ],
                                        vendors         : ['Epilog', 'GCC', 'Trotec', 'Roland', 'Othermachine', 'Oxford']
				   },
		     laserPanel   : laserPanelText,
                     vinylPanel   : vinylPanelText,
                     millingPanel : millingPanelText,
                     errors: null
                    };

exports.dashboardPage = dashboardPage; 

var welcomeMsg = infoMsg.welcomeMsg;
exports.welcomeMsg = welcomeMsg; 

var validationMsg = infoMsg.validationMsg
exports.validationMsg = validationMsg;

var panelNames = pageContent.panelNames;
exports.panelNames = panelNames;

var userRoles = pageContent.userRoles;
exports.userRoles = userRoles;

