angular.module('TicTacToe').controller('SettingsController', function ($scope, Account) {
    $scope.success = null;
    $scope.error = null;
    $scope.settingsAccount = Account.get();

    $scope.save = function () {
        Account.save($scope.settingsAccount,
                     function () {
                         $scope.error = null;
                         $scope.success = 'OK';
                         $scope.settingsAccount = Account.get();
                     },
                     function () {
                         $scope.success = null;
                         $scope.error = "ERROR";
                     });
    };
});
