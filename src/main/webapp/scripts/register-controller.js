angular.module('TicTacToe').controller('RegisterController', function ($scope, $translate, Register) {
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
            Register.save($scope.registerAccount,
                          function (value, responseHeaders) {
                              $scope.error = null;
                              $scope.errorUserExists = null;
                              $scope.success = 'OK';
                          },
                          function (httpResponse) {
                              $scope.success = null;
                              if (httpResponse.status === 304 &&
                                  httpResponse.data.error && httpResponse.data.error === "Not Modified") {
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
