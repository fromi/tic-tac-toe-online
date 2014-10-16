angular.module('TicTacToe').controller('PasswordController', function ($scope, $http) {
    $scope.success = null;
    $scope.error = null;
    $scope.doNotMatch = null;
    $scope.changePassword = function () {
        if ($scope.password != $scope.confirmPassword) {
            $scope.doNotMatch = "ERROR";
        } else {
            $scope.doNotMatch = null;
            $http.post('app/rest/account/change_password', $scope.password).success(function () {
                $scope.error = null;
                $scope.success = 'OK';
            }).error(function () {
                $scope.success = null;
                $scope.error = "ERROR";
            });
        }
    };
});
