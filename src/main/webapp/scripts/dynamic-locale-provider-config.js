angular.module('TicTacToe').config(function (tmhDynamicLocaleProvider) {
    tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_{{locale}}.js')
    tmhDynamicLocaleProvider.useCookieStorage('NG_TRANSLATE_LANG_KEY');
});
