angular.module('app.controllers')

.controller('signInCtrl',['$scope', '$stateParams', '$http', '$rootScope', '$ionicPopup', '$window', '$cookieStore', 'igniteDB', 'AuthorizationService', 'GatewayApiService', // TIP: Access Route Parameters for your page via $stateParams.parameterName

function ($scope, $stateParams, $http, $rootScope, $ionicPopup, $window, $cookieStore, igniteDB, AuthorizationService, GatewayApiService) {

	console.log('signInCtrl default const');

	$scope.user = {};


	$scope.constructPage = function() {
		console.log('signInCtrl const');
		igniteDB.getKeyValue(KEY_ACCESS_TOKEN).then(
			function (accessToken) {
				if(accessToken){
					console.log('signInCtrl redirect gateways');
					$window.location.href = "#/menu/gateways";
				}else{
					console.log('Token not found');
				}
			}
		)
	}

	$scope.signIn = function() {

		if ($scope.user.email == "" || $scope.user.email == undefined) {

			$ionicPopup.show({
				template: "Email is empty",
				title: "Error",
				buttons: [
					{
						text: "Ok"
					}
				]
			});

		} else if( emailValidate($scope.user.email) == false) {

			$ionicPopup.show({
				template: "Incorrect e-mail format",
				title: "Error",
				buttons: [
					{
						text: "Ok"
					}
				]
			});

		} else if ($scope.user.password == "" || $scope.user.password == undefined) {

			$ionicPopup.show({
				template: "Password is empty",
				title: "Error",
				buttons: [
					{
						text: "Ok"
					}
				]
			});

		} else {
			AuthorizationService.login($scope.user.email, $scope.user.password, function(data){
				$window.location.href = "#/menu/gateways";
			}, function(response){
					if(response.status > 0) {
							$ionicPopup.show({
								template: "Your email or password is incorrect",
								title: "Error",
								buttons: [
									{
										text: "Ok"
									}
								]
							});
					} else {
						$ionicPopup.show({
							template: response,
							title: "Error",
							buttons: [
								{
									text: "Ok"
								}
							]
						});
					}
		});
		}
	}
}])
