'use strict';

/* App Module */
var httpHeaders;

angular.module('TicTacToe', ['http-auth-interceptor', 'tmh.dynamicLocale',
    'ngResource', 'ngRoute', 'ngCookies', 'TicTacToeUtils', 'pascalprecht.translate', 'truncate']);

angular.module('TicTacToe').config(function ($httpProvider) {
    // WTF
    httpHeaders = $httpProvider.defaults.headers;
});

angular.module('TicTacToe').run(function ($rootScope, $location, $http, AuthenticationSharedService, Session, USER_ROLES) {
    $rootScope.$on('$routeChangeStart', function (event, next) {
        $rootScope.isAuthorized = AuthenticationSharedService.isAuthorized;
        $rootScope.userRoles = USER_ROLES;
        AuthenticationSharedService.valid(next.access.authorizedRoles);
    });

    // Call when the the client is confirmed
    $rootScope.$on('event:auth-loginConfirmed', function (data) {
        $rootScope.authenticated = true;
        if ($location.path() === "/login") {
            var search = $location.search();
            if (search.redirect !== undefined) {
                $location.path(search.redirect).search('redirect', null).replace();
            } else {
                $location.path('/').replace();
            }
        }
    });

    // Call when the 401 response is returned by the server
    $rootScope.$on('event:auth-loginRequired', function (rejection) {
        Session.invalidate();
        $rootScope.authenticated = false;
        if ($location.path() !== "/" && $location.path() !== "" && $location.path() !== "/register" &&
            $location.path() !== "/activate" && $location.path() !== "/login") {
            var redirect = $location.path();
            $location.path('/login').search('redirect', redirect).replace();
        }
    });

    // Call when the 403 response is returned by the server
    $rootScope.$on('event:auth-notAuthorized', function (rejection) {
        $rootScope.errorMessage = 'errors.403';
        $location.path('/error').replace();
    });

    // Call when the user logs out
    $rootScope.$on('event:auth-loginCancelled', function () {
        $location.path('');
    });
});

angular.module('TicTacToe').run(function ($rootScope, $route) {
    // This uses the Atmoshpere framework to do a Websocket connection with the server, in order to send
    // user activities each time a route changes.
    // The user activities can then be monitored by an administrator, see the views/tracker.html Angular view.

    $rootScope.websocketSocket = atmosphere;
    $rootScope.websocketSubSocket;
    $rootScope.websocketTransport = 'websocket';

    $rootScope.websocketRequest = { url: 'websocket/activity',
        contentType: "application/json",
        transport: $rootScope.websocketTransport,
        trackMessageLength: true,
        reconnectInterval: 5000,
        enableXDR: true,
        timeout: 60000 };

    $rootScope.websocketRequest.onOpen = function (response) {
        $rootScope.websocketTransport = response.transport;
        $rootScope.websocketRequest.sendMessage();
    };

    $rootScope.websocketRequest.onClientTimeout = function (r) {
        $rootScope.websocketRequest.sendMessage();
        setTimeout(function () {
            $rootScope.websocketSubSocket = $rootScope.websocketSocket.subscribe($rootScope.websocketRequest);
        }, $rootScope.websocketRequest.reconnectInterval);
    };

    $rootScope.websocketRequest.onClose = function (response) {
        if ($rootScope.websocketSubSocket) {
            $rootScope.websocketRequest.sendMessage();
        }
    };

    $rootScope.websocketRequest.sendMessage = function () {
        if ($rootScope.websocketSubSocket.request.isOpen) {
            if ($rootScope.account != null) {
                $rootScope.websocketSubSocket.push(atmosphere.util.stringifyJSON({
                                                                                     userLogin: $rootScope.account.login,
                                                                                     page: $route.current.templateUrl})
                );
            }
        }
    }

    $rootScope.websocketSubSocket = $rootScope.websocketSocket.subscribe($rootScope.websocketRequest);

    $rootScope.$on("$routeChangeSuccess", function (event, next, current) {
        $rootScope.websocketRequest.sendMessage();
    });
});
