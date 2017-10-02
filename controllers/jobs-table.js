var dashboard = require('./lib/dashboard');

var panelNames    = dashboard.panelNames;
var dashboardPage = dashboard.dashboardPage;

module.exports.controller = function (req, res) {

dashboardPage.displayProfile = false;
dashboardPage.displayWizard = false;
dashboardPage.displayTerminal = false;
dashboardPage.displaySettings = false;
dashboardPage.displayLogs = false;
dashboardPage.uploadSuccess = false;
dashboardPage.displayControl = false;
dashboardPage.displayMonitor = false
dashboardPage.displayJobsTable = true;
dashboardPage.currentPanelName = panelNames.jobs;
dashboardPage.currentPanelRoute = '/dashboard/jobs';

if (!dashboardPage.userName){
    res.redirect('/dashboard');
}else{
    dashboardPage.errors = null;
    res.render('dashboard', dashboardPage);
}
}
