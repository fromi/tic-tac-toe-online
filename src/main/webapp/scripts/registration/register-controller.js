angular.module('TicTacToe').controller('RegisterController', function ($scope, $translate, $http) {
    $scope.success = null;
    $scope.error = null;
    $scope.doNotMatch = null;
    $scope.errorUserExists = null;
    $scope.register = function () {
        if ($scope.registerAccount.password != $scope.confirmPassword) {
            $scope.doNotMatch = "ERROR";
        } else {
            $scope.registerAccount.langKey = $translate.use();
            $scope.doNotMatch = null;
            $http.post('app/rest/register', $scope.registerAccount).success(function () {
                $scope.error = null;
                $scope.errorUserExists = null;
                $scope.success = 'OK';
            }).error(function (data, status) {
                $scope.success = null;
                if (status === 304 &&
                    data.error && data.error === "Not Modified") {
                    $scope.error = null;
                    $scope.errorUserExists = "ERROR";
                } else {
                    $scope.error = "ERROR";
                    $scope.errorUserExists = null;
                }
            });
        }
    }
});
