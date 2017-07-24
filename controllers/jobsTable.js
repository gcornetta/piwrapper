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
dashboardPage.displayJobsTable = true;
dashboardPage.currentPanelName = panelNames.jobsTable;
dashboardPage.currentPanelRoute = '/dashboard/jobsTable';

if (!dashboardPage.userName){
    res.redirect('/dashboard');
}else{
    res.render('dashboard', dashboardPage);
}
}