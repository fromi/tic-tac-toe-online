angular.module('TicTacToe').controller('LogoutController', function ($location, AuthenticationSharedService) {
    AuthenticationSharedService.logout();
});
