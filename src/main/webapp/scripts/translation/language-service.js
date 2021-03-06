angular.module('TicTacToe').factory('LanguageService', function ($http, $translate, LANGUAGES) {
    return {
        getBy: function (language) {
            if (language == undefined) {
                language = $translate.storage().get('NG_TRANSLATE_LANG_KEY');
            }
            if (language == undefined) {
                language = 'en';
            }

            var promise = $http.get('/i18n/' + language + '.json').then(function () {
                return LANGUAGES;
            });
            return promise;
        }
    };
});
