// Initialize angular-translate
angular.module('TicTacToe').config(function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({prefix: 'i18n/', suffix: '.json'});
    $translateProvider.preferredLanguage('en');
    $translateProvider.useCookieStorage();
});
