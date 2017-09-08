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
dashboardPage.displayJobsTable = false;
dashboardPage.displayGraphs = true;
dashboardPage.currentPanelName = panelNames.graphs;
dashboardPage.currentPanelRoute = '/dashboard/graphs';

if (!dashboardPage.userName){
    res.redirect('/dashboard');
}else{
    dashboardPage.errors = null;
    res.render('dashboard', dashboardPage);
}
}
