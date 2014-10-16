angular.module('TicTacToe').controller('MetricsController', function ($scope, $http) {

    $scope.metrics = {};
    $scope.updatingHealth = true;
    $scope.updatingMetrics = true;

    $scope.refresh = function () {
        $scope.updatingHealth = true;
        $scope.updatingMetrics = true;

        $http.get('health').success(function(data) {
            $scope.healthCheck = data;
        }).error(function(data) {
            $scope.healthCheck = data;
        }).finally(function() {
            $scope.updatingHealth = false;
        });

        $http.get('metrics/metrics').success(function(data) {
            $scope.metrics = data;
        }).error(function(data) {
            $scope.metrics = data;
        }).finally(function() {
            $scope.updatingMetrics = false;
        });
    };

    $scope.$watch('metrics', function (newValue) {
        $scope.servicesStats = {};
        $scope.cachesStats = {};
        angular.forEach(newValue.timers, function (value, key) {
            if (key.indexOf("web.rest") != -1 || key.indexOf("service") != -1) {
                $scope.servicesStats[key] = value;
            }

            if (key.indexOf("net.sf.ehcache.Cache") != -1) {
                // remove gets or puts
                var index = key.lastIndexOf(".");
                var newKey = key.substr(0, index);

                // Keep the name of the domain
                index = newKey.lastIndexOf(".");
                $scope.cachesStats[newKey] = {
                    'name': newKey.substr(index + 1),
                    'value': value
                };
            }
            ;
        });
    });

    $scope.refresh();

    $scope.threadDump = function () {
        $http.get('dump').success(function (data) {
            $scope.threadDump = data;

            $scope.threadDumpRunnable = 0;
            $scope.threadDumpWaiting = 0;
            $scope.threadDumpTimedWaiting = 0;
            $scope.threadDumpBlocked = 0;

            angular.forEach(data, function (value) {
                if (value.threadState == 'RUNNABLE') {
                    $scope.threadDumpRunnable += 1;
                } else if (value.threadState == 'WAITING') {
                    $scope.threadDumpWaiting += 1;
                } else if (value.threadState == 'TIMED_WAITING') {
                    $scope.threadDumpTimedWaiting += 1;
                } else if (value.threadState == 'BLOCKED') {
                    $scope.threadDumpBlocked += 1;
                }
            });

            $scope.threadDumpAll = $scope.threadDumpRunnable + $scope.threadDumpWaiting +
                $scope.threadDumpTimedWaiting + $scope.threadDumpBlocked;

        });
    };

    $scope.getLabelClass = function (threadState) {
        if (threadState == 'RUNNABLE') {
            return "label-success";
        } else if (threadState == 'WAITING') {
            return "label-info";
        } else if (threadState == 'TIMED_WAITING') {
            return "label-warning";
        } else if (threadState == 'BLOCKED') {
            return "label-danger";
        }
    };
});
