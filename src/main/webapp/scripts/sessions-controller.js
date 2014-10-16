angular.module('TicTacToe').controller('SessionsController', function ($scope, resolvedSessions, Sessions) {
    $scope.success = null;
    $scope.error = null;
    $scope.sessions = resolvedSessions;
    $scope.invalidate = function (series) {
        Sessions.delete({series: encodeURIComponent(series)},
                        function () {
                            $scope.error = null;
                            $scope.success = "OK";
                            $scope.sessions = Sessions.get();
                        },
                        function () {
                            $scope.success = null;
                            $scope.error = "ERROR";
                        });
    };
});
