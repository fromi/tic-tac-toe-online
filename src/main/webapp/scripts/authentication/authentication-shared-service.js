angular.module('TicTacToe').factory('AuthenticationSharedService', function ($rootScope, $http, authService, Session, Account, Base64Service, AccessToken) {
    return {
        login: function (param) {
            var data = "username=" + param.username + "&password=" + param.password + "&grant_type=password&scope=read%20write&client_secret=mySecretOAuthSecret&client_id=TicTacToeapp";
            $http.post('oauth/token', data, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                    "Authorization": "Basic " + Base64Service.encode("TicTacToeapp" + ':' + "mySecretOAuthSecret")
                },
                ignoreAuthModule: 'ignoreAuthModule'
            }).success(function (data) {
                httpHeaders.common['Authorization'] = 'Bearer ' + data.access_token;
                AccessToken.set(data);

                Account.get(function (data) {
                    Session.create(data.login, data.firstName, data.lastName, data.email, data.roles);
                    $rootScope.account = Session;
                    authService.loginConfirmed(data);
                });
            }).error(function () {
                $rootScope.authenticationError = true;
                Session.invalidate();
            });
        },
        valid: function (authorizedRoles) {
            if (AccessToken.get() !== null) {
                httpHeaders.common['Authorization'] = 'Bearer ' + AccessToken.get();
            }

            $http.get('protected/authentication_check.gif', {
                ignoreAuthModule: 'ignoreAuthModule'
            }).success(function () {
                if (!Session.login || AccessToken.get() != undefined) {
                    if (AccessToken.get() == undefined || AccessToken.expired()) {
                        $rootScope.authenticated = false;
                        return;
                    }
                    Account.get(function (data) {
                        Session.create(data.login, data.firstName, data.lastName, data.email, data.roles);
                        $rootScope.account = Session;
                        $rootScope.authenticated = true;
                    });
                }
                $rootScope.authenticated = !!Session.login;
            }).error(function (data) {
                $rootScope.authenticated = false;

                if (!$rootScope.isAuthorized(authorizedRoles)) {
                    $rootScope.$broadcast('event:auth-loginRequired', data);
                }
            });
        },
        isAuthorized: function (authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                if (authorizedRoles == '*') {
                    return true;
                }

                authorizedRoles = [authorizedRoles];
            }

            var isAuthorized = false;
            angular.forEach(authorizedRoles, function (authorizedRole) {
                var authorized = (!!Session.login &&
                    Session.userRoles.indexOf(authorizedRole) !== -1);

                if (authorized || authorizedRole == '*') {
                    isAuthorized = true;
                }
            });

            return isAuthorized;
        },
        logout: function () {
            $rootScope.authenticationError = false;
            $rootScope.authenticated = false;
            $rootScope.account = null;
            AccessToken.remove();

            $http.get('app/logout');
            Session.invalidate();
            delete httpHeaders.common['Authorization'];
            authService.loginCancelled();
        }
    };
});
