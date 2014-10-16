angular.module('TicTacToe').config(function ($routeProvider, USER_ROLES) {
    $routeProvider
        .when('/register', {
                  templateUrl: 'views/register.html',
                  controller: 'RegisterController',
                  access: {
                      authorizedRoles: [USER_ROLES.all]
                  }
              })
        .when('/activate', {
                  templateUrl: 'views/activate.html',
                  controller: 'ActivationController',
                  access: {
                      authorizedRoles: [USER_ROLES.all]
                  }
              })
        .when('/login', {
                  templateUrl: 'views/login.html',
                  controller: 'LoginController',
                  access: {
                      authorizedRoles: [USER_ROLES.all]
                  }
              })
        .when('/error', {
                  templateUrl: 'views/error.html',
                  access: {
                      authorizedRoles: [USER_ROLES.all]
                  }
              })
        .when('/settings', {
                  templateUrl: 'views/settings.html',
                  controller: 'SettingsController',
                  access: {
                      authorizedRoles: [USER_ROLES.user]
                  }
              })
        .when('/password', {
                  templateUrl: 'views/password.html',
                  controller: 'PasswordController',
                  access: {
                      authorizedRoles: [USER_ROLES.user]
                  }
              })
        .when('/sessions', {
                  templateUrl: 'views/sessions.html',
                  controller: 'SessionsController',
                  resolve: {
                      resolvedSessions: ['Sessions', function (Sessions) {
                          return Sessions.get();
                      }]
                  },
                  access: {
                      authorizedRoles: [USER_ROLES.user]
                  }
              })
        .when('/tracker', {
                  templateUrl: 'views/tracker.html',
                  controller: 'TrackerController',
                  access: {
                      authorizedRoles: [USER_ROLES.admin]
                  }
              })
        .when('/metrics', {
                  templateUrl: 'views/metrics.html',
                  controller: 'MetricsController',
                  access: {
                      authorizedRoles: [USER_ROLES.admin]
                  }
              })
        .when('/logs', {
                  templateUrl: 'views/logs.html',
                  controller: 'LogsController',
                  resolve: {
                      resolvedLogs: ['LogsService', function (LogsService) {
                          return LogsService.findAll();
                      }]
                  },
                  access: {
                      authorizedRoles: [USER_ROLES.admin]
                  }
              })
        .when('/audits', {
                  templateUrl: 'views/audits.html',
                  controller: 'AuditsController',
                  access: {
                      authorizedRoles: [USER_ROLES.admin]
                  }
              })
        .when('/logout', {
                  templateUrl: 'views/main.html',
                  controller: 'LogoutController',
                  access: {
                      authorizedRoles: [USER_ROLES.all]
                  }
              })
        .when('/docs', {
                  templateUrl: 'views/docs.html',
                  access: {
                      authorizedRoles: [USER_ROLES.admin]
                  }
              })
        .otherwise({
                       templateUrl: 'views/main.html',
                       controller: 'MainController',
                       access: {
                           authorizedRoles: [USER_ROLES.all]
                       }
                   });
});
