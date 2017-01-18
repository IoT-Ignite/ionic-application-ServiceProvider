angular.module('app.controllers', ['ngCookies'])


.controller('menuCtrl', ['$rootScope', '$scope', '$stateParams', '$cookieStore', '$window', '$http', '$ionicPopup', 'LogoutService', '$ionicHistory', // TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($rootScope, $scope, $stateParams, $cookieStore, $window, $http, $ionicPopup, LogoutService, $ionicHistory) {

	$scope.logout = function() {

		// Service Provider Cookies Remove
		LogoutService.logout(function(result){
			console.log("logout is running");
			$ionicHistory.clearCache();
   		$ionicHistory.clearHistory();
			$ionicPopup.show({
				template: "Logout is successs",
				title: "Logout",
				buttons: [
					{
						text: "Ok"
					}
				]
			});

			$window.location.href = '#/home';
		}, function(error){
			console.log(error);
		})

	}
}])

.controller('homeCtrl', ['$rootScope', '$scope', '$stateParams', '$http', '$window', 'igniteDB', 'GatewayApiService', // TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($rootScope, $scope, $stateParams, $http, $window, igniteDB, GatewayApiService) {
	$scope.constructHomePage = function() {
		console.log('homeCtrl const');
	}
}])

.controller('signUpCtrl', ['$scope', '$stateParams', '$http', '$rootScope', '$ionicPopup', '$cookieStore', '$window', 'igniteDB', 'IgniteApiService', // TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $http, $rootScope, $ionicPopup, $cookieStore, $window, igniteDB, IgniteApiService) {

		$scope.data = {};
		$scope.alerts = [];
		$scope.closeAlert = function(index) {
			$scope.alerts.splice(index, 1);
		};

		$scope.signUp = function() {
			$scope.apiRunning = true;
			$scope.alerts = [];
			if (!$scope.data.brand) {
				$ionicPopup.show({
					template: "Brand is empty",
					title: "Error",
					buttons: [
						{
							text: "Ok"
						}
					]
				});
			}

			else if (!$scope.data.name) {

				$ionicPopup.show({
					template: "Name is empty",
					title: "Error",
					buttons: [
						{
							text: "Ok"
						}
					]
				});

			} else if ( $scope.data.name.length < 2 ) {

				$ionicPopup.show({
					template: "Name is too short",
					title: "Error",
					buttons: [
						{
							text: "Ok"
						}
					]
				});

			} else if (!$scope.data.surname) {

				$ionicPopup.show({
					template: "Surname is empty",
					title: "Error",
					buttons: [
						{
							text: "Ok"
						}
					]
				});

			} else if ( $scope.data.surname.length < 2 ) {

				$ionicPopup.show({
					template: "Surname is too short",
					title: "Error",
					buttons: [
						{
							text: "Ok"
						}
					]
				});

			} else if (!$scope.data.email) {

				$ionicPopup.show({
					template: "Email is empty",
					title: "Error",
					buttons: [
						{
							text: "Ok"
						}
					]
				});

			} else if( emailValidate($scope.data.email) == false) {

				$ionicPopup.show({
					template: "Incorrect e-mail format",
					title: "Error",
					buttons: [
						{
							text: "Ok"
						}
					]
				});

			} else if (!$scope.data.password) {

			$ionicPopup.show({
				template: "Password is empty",
				title: "Error",
				buttons: [
					{
						text: "Ok"
					}
				]
			});

			} else if ($scope.data.password != $scope.data.repassword) {

				$ionicPopup.show({
					template: "The password does not match",
					title: "Error",
					buttons: [
						{
							text: "Ok"
						}
					]
				});

			} else if ( $scope.data.password.length < 6 ) {

				$ionicPopup.show({
					template: "Password is too short",
					title: "Error",
					buttons: [
						{
							text: "Ok"
						}
					]
				});
			} else {
				IgniteApiService.createRestrictedUser($scope.data.name, $scope.data.surname, $scope.data.email,
					$scope.data.password, $scope.data.brand, 'PRODUCTION',
					function(data){
						console.log("POST (create-restricted-user): ");

						$ionicPopup.show({
							template: "User created",
							title: "Your registration is successfull",
							buttons: [
							{text: "Ok"}]
						});
						$window.location.href = "#/signIn";

					}, function(response) {
						if(response.status == 409) {
							$scope.alerts.push({type: 'warning', msg: "This email account is already registered. Please sign in."});
						} else {
							$scope.alerts.push({type: 'warning', msg: "An account could not be registered!"});
						}
					})
	    }
			$scope.apiRunning = false;
		}
}])

.controller('forgotPasswordCtrl', ['$scope', '$stateParams','$window', '$http', '$ionicPopup','AuthorizationService', // TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $window, $http, $ionicPopup, AuthorizationService) {

	$scope.user = {};

	$scope.forgotPassword = function () {
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

		} else {
			AuthorizationService.forgetPassword($scope.user.email, "SPA APP", UI_URL + "/access/login/change?token=%%ACTIVATION_CODE%%", "SPA", function(data){
				$ionicPopup.show({
					template: "Password restart instruction has been send to your email",
					title: "Success",
					buttons: [
						{
							text: "Ok"
						}
					]
				});
				$window.location.href = "#/signIn";
			}, function(data){
				$ionicPopup.show({
					template: "Password restart instruction has not been send to your email",
					title: "Error",
					buttons: [
						{
							text: "Ok"
						}
					]
				});
			})
		}
	}
}])


.controller('profileCtrl', ['$rootScope', '$scope', '$stateParams', '$http', '$ionicPopup', 'igniteDB', 'AuthorizationService',// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($rootScope, $scope, $stateParams, $http, $ionicPopup, igniteDB, AuthorizationService) {

	$scope.data = {};
	/*
	* * AP - DB imp
	* */

	$scope.changePassword = function() {
		if(!$scope.data.currentPassword) {
			$ionicPopup.show({
				template: "Current password is empty",
				title: "Error",
				buttons: [
					{
						text: "Ok"
					}
				]
			});
		} else if(!$scope.data.newPassword) {
			$ionicPopup.show({
				template: "New password is empty",
				title: "Error",
				buttons: [
					{
						text: "Ok"
					}
				]
			});
		} else if(!$scope.data.newRePassword) {
			$ionicPopup.show({
				template: "Repassword is empty",
				title: "Error",
				buttons: [
					{
						text: "Ok"
					}
				]
			});
		} else if($scope.data.newPassword != $scope.data.newRePassword) {
			$ionicPopup.show({
				template: "New password and new repassword doesn't match.",
				title: "Error",
				buttons: [
					{
						text: "Ok"
					}
				]
			});
		} else {
			AuthorizationService.changePassword($scope.data.currentPassword, $scope.data.newPassword,
				function(data){
					$ionicPopup.show({
						template: "Password is changed!",
						title: "Success",
						buttons: [
							{
								text: "Ok"
							}
						]
					});
				},function(data){
					$ionicPopup.show({
						template: "Invalid current password!",
						title: "Error",
						buttons: [
							{
								text: "Ok"
							}
						]
					});
				});
			}
	}

}])

.controller('gatewaysCtrl', ['$rootScope', '$scope', '$stateParams', '$cookieStore', '$http', '$window', 'igniteDB', 'GatewayApiService', // TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($rootScope, $scope, $stateParams, $cookieStore, $http, $window, igniteDB, GatewayApiService) {
	$scope.device = {};
	$scope.alerts = [];
	$scope.loadCompleted = false;
	$scope.deviceList = [];

	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.constructGateways = function(refresh){
		$scope.device = {};
		$scope.alerts = [];
		$scope.loadCompleted = false;
		$scope.deviceList = [];
		GatewayApiService.getDeviceList("", function(success){
			console.log(success.data);
			$scope.deviceList = [];
			$scope.loadCompleted = true;

			for(var i = 0; i < success.data.content.length; i++) {
				var deviceName = success.data.content[i].label ? success.data.content[i].label : success.data.content[i].deviceId;
				var deviceStatus = success.data.content[i].presence.state;
				var deviceId = success.data.content[i].deviceId;
				var deviceCode = success.data.content[i].code;

				if(deviceStatus == "ONLINE") {
					deviceStatus = true;
				} else {
					deviceStatus = false;
				}
				$scope.deviceList.push({deviceName:deviceName,deviceStatus:deviceStatus,deviceInfo:{deviceCode:deviceCode,deviceId:deviceId}});
			}

			$scope.goDetail = function(e) {
				$cookieStore.put('deviceId', e.deviceId);

				if(e.deviceId) {
					$window.location.href = '#/menu/gatewaydetail';
				} else {
					console.log("None | Device Id");
				}
			}

			}, function(error){
				$scope.deviceList = [];
				$scope.loadCompleted = true;

				if(error.status == 404){
					console.log("There is no registered device");
					$scope.alerts.push({type: 'warning', msg: "There is no registered device"});
				}else{
					console.log("Error" + JSON.stringify(error));
					$scope.alerts.push({type: 'warning', msg: "Error:" +  JSON.stringify(error)});
				}

			});
		}
}])

.controller('thingsCtrl', ['$rootScope', '$scope', '$stateParams', '$http', '$cookieStore', '$ionicPopup', 'igniteDB', 'GatewayApiService',// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($rootScope, $scope, $stateParams, $http, $cookieStore, $ionicPopup, igniteDB, GatewayApiService) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.constructThingsCtrl = function(refresh){
	$scope.alerts = [];
	$scope.deviceId = $cookieStore.get("deviceId");
	GatewayApiService.getThingsList($scope.deviceId, function(success) {
    var nodes = success.data.extras.nodes;

    $scope.nodes = [];
		for (var i = 0; i < nodes.length; i++) {
			var things = nodes[i].things;

			var thingsInfo = [];
			for(var j = 0; j < things.length; j++) {
				thingsInfo.push({id: things[j].id, status: things[j].connected});
			}

			$scope.nodes[i] = {
			  nodeId: nodes[i].nodeId,
			  status: nodes[i].connected,
			  things: thingsInfo
			};
		}
		if($scope.nodes.length == 0) {
			$scope.alerts.push({type: 'warning', msg: "Could not find any things in gateway" , timeout : "2000"});
		}
    /*
     * if given group is the selected group, deselect it
     * else, select the given group
     */
    $scope.toggleGroup = function(group) {
      if ($scope.isGroupShown(group)) {
        $scope.shownGroup = null;
      } else {
        $scope.shownGroup = group;
      }
    };

    $scope.isGroupShown = function(group) {
      return $scope.shownGroup === group;
    };

		if(refresh){
			$scope.$apply();
		}

  }, function (error) {
		if(error.status == 404){
			console.log("There is no registered node and sensor yet");
			$scope.alerts.push({type: 'warning', msg: "There is no registered node and sensor yet"});
			$scope.nodes = [];
		}else{
			console.log("Error" + error);
			$scope.alerts.push({type: 'warning', msg: "Error:" +  JSON.stringify(error)});
		}
		if(refresh){
			$scope.$apply();
		}
	})
 }

 $scope.unregisterNodeConfirm = function(nodeId) {
	 var confirmPopup = $ionicPopup.confirm({
		 title: 'Confirm',
		 template: 'Are you sure you want to unregister ' + nodeId + '?'
	 });

	 confirmPopup.then(function(res) {
		 if(res) {
			 console.log(nodeId + " unregister");
			 $scope.unregisterNode(nodeId);
		 }
	 });
 }

 $scope.unregisterThingConfirm = function(nodeId, thingId) {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Confirm',
     template: 'Are you sure you want to unregister ' + nodeId + ' / ' + thingId + '?'
   });

   confirmPopup.then(function(res) {
     if(res) {
			 console.log(nodeId + " / " + thingId + " unregister");
			 $scope.unregisterThing(nodeId, thingId);
     }
   });
 }

 $scope.unregisterNode = function(nodeId) {
	 $scope.alerts = [];
 	 $scope.deviceId = $cookieStore.get("deviceId");
	 if(nodeId) {
		 GatewayApiService.pushUnregisterNode($scope.deviceId, nodeId, function(success) {
			 console.log(nodeId + " unregistered");
			 $scope.alerts.push({type: 'warning', msg: nodeId + " unregistered", timeout: "5000"});
		 }, function (error) {
			 console.log(nodeId + " could not unregistered");
			 $scope.alerts.push({type: 'danger', msg: nodeId + " could not unregistered"});
		 })
	 }
 }

 $scope.unregisterThing = function(nodeId, thingId) {
	 $scope.alerts = [];
 	 $scope.deviceId = $cookieStore.get("deviceId");
	 if(nodeId && thingId) {
		 GatewayApiService.pushUnregisterThing($scope.deviceId, nodeId, thingId, function(success) {
			 console.log(nodeId + " " + thingId + " unregistered");
			 $scope.alerts.push({type: 'warning', msg: nodeId + " " + thingId + " unregistered", timeout: "5000"});
		 }, function (error) {
			 console.log(nodeId + " could not unregistered");
			 $scope.alerts.push({type: 'danger', msg: nodeId + " " + thingId + " could not unregistered"});
		 })
	 }
 }
}])

.controller('gatewayDetailCtrl', ['$rootScope', '$scope', '$stateParams', '$http', '$cookieStore', 'igniteDB', 'GatewayApiService',// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($rootScope, $scope, $stateParams, $http, $cookieStore, igniteDB, GatewayApiService) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.updateGateway = function() {
		var label = $scope.deviceDetail.deviceName;
		var code = $scope.deviceDetail.deviceCode;
		if(label) {
			GatewayApiService.updateDeviceLabel(code, label, function(success) {
				//$scope.deviceDetail.deviceName = $scope.deviceDetail.deviceName;
				console.log("Label updated");
				$scope.alerts.push({type: 'warning', msg: "Label updated", timeout: "5000"});

				GatewayApiService.pushDeviceLabel(code, function(success) {
					console.log("Label pushed to device");
					$scope.alerts.push({type: 'warning', msg: "Label pushed to device", timeout: "5000"});
				}, function (error) {
					console.log("Label could not pushed to device");
					$scope.alerts.push({type: 'danger', msg: "Label could not pushed to device"});
				})

			}, function (error) {
				console.log("Label could not updated");
				$scope.alerts.push({type: 'danger', msg: "Label could not updated"});
			})
		}
	}

	$scope.constructGatewayDetailCtrl = function(refresh){
		$scope.alerts = [];
		$scope.deviceId = $cookieStore.get("deviceId");
		GatewayApiService.getGatewayDetail($scope.deviceId, function(success) {
			var deviceModeStatus = success.data.status;
			var deviceName = success.data.label;
			var deviceId = success.data.deviceId;
			var deviceIp = "";
			var deviceCode = success.data.code;
			if(success.data.network && success.data.network.wifi) {
				deviceIp = success.data.network.wifi.ip;
			}

			$scope.deviceDetail = {deviceCode: deviceCode, deviceName: deviceName, deviceModeStatus: deviceModeStatus, deviceId: deviceId, deviceIp: deviceIp};
		}, function(error) {
			console.log("Error in getDeviceDetail" + error);
		})
		$scope.thingsCount = 0;
		GatewayApiService.getThingsList($scope.deviceId, function(success) {
			var nodes = success.data.extras.nodes;

			var thingsCount = 0;
			for(var i = 0; i < nodes.length; i++) {
				 thingsCount += nodes[i].things.length;
			}
			$scope.thingsCount = thingsCount;
			if(refresh){
				$scope.$apply();
			}
		}, function (error) {
			if(error.status == 404){
				console.log("There is no registered node and sensor yet");
				$scope.alerts.push({type: 'warning', msg: "There is no registered node and sensor yet"});
			}else{
				console.log("Error" + error);
				$scope.alerts.push({type: 'warning', msg: "Error:" +  JSON.stringify(error)});
			}
			if(refresh){
				$scope.$apply();
			}
		})
	}
}])

.controller('scanCtrl', ['$scope', '$stateParams', '$rootScope', 'NetworkService', // TIP: Access Route Parameters for your page via $stateParams.parameterName
  function ($scope, $stateParams, $rootScope, NetworkService) {
    $scope.itemList = [];

		$scope.closeAlert = function(index) {
			$scope.alerts.splice(index, 1);
		};

		$scope.constructNodeList = function(refresh){
			$scope.itemList = [];
			$scope.scanCompleted = false;
			$scope.alerts = [];
			var filter = "IotIgnite";
			try{
				NetworkService.listWifi(function(wifi){
						var igniteWifiArray = NetworkService.filterWifi(wifi, filter);
						//$scope.alerts.push({type: 'warning', msg: "Could not find any Ignite Gateways in WiFi222"});
						if (igniteWifiArray.length == 0) {
							$scope.alerts.push({type: 'warning', msg: "Could not find any Ignite Node in WiFi" , timeout : "2000"});
						}
						$scope.itemList = igniteWifiArray;
						$scope.scanCompleted = true;
						if(refresh){
							$scope.$apply();
						}
					}, function(error){
						$scope.alerts.push({type: 'danger', msg: error });
						$scope.scanCompleted = true;
						if(refresh){
							$scope.$apply();
						}
					});
			}catch(err){
				$scope.alerts.push({type: 'danger', msg: 'Unknown error. Error detail:' + err });
				$scope.scanCompleted = true;
			}

		};

    $scope.constructGatewayList = function(refresh){
			$scope.itemListWifi = [];
			$scope.itemListNSD = [];
			$scope.scanCompleted = false;
			$scope.alerts = [];
			var filter = "IGNITE_GATEWAY";
			var nsdType = "_iotignite_agent._tcp.";

			try{
				NetworkService.listWifi(function(wifi){
						var igniteWifiArray = NetworkService.filterWifi(wifi, filter);
						var igniteNSDArray = [];
						/*
						NetworkService.getHostName(function(hostName) {
							console.log("Hostname:" + hostName);
						});
						*/
						//NetworkService.watch(nsdType, 'local.');
						NetworkService.watch(nsdType, 'local.', 25000).then(function(NSDArray) {
							for(var i = 0; i < NSDArray.length; i++) {
								igniteNSDArray.push(NSDArray[i]);
							}

							//$scope.alerts.push({type: 'warning', msg: "Could not find any Ignite Gateways in WiFi222"});
							if (igniteWifiArray.length == 0 && igniteNSDArray.length ==0) {
								$scope.alerts.push({type: 'warning', msg: "Could not find any Ignite Gateway", timeout : "2000"});
							}
							$scope.itemWifiList = igniteWifiArray;
							$scope.itemNSDList = igniteNSDArray;
							$scope.scanCompleted = true;


						}, null);

						if(refresh){
							$scope.$apply();
						}

					}, function(error){
						$scope.alerts.push({type: 'danger', msg: error });
						$scope.scanCompleted = true;
						if(refresh){
							$scope.$apply();
						}
					});
			}catch(err){
				$scope.alerts.push({type: 'danger', msg: 'Unknown error. Error detail:' + err });
				$scope.scanCompleted = true;
			}

		};

		$scope.setName = function(name){
		  console.log("(setName) init");
		  $rootScope.Name = name;
		  console.log("($rootScope.Name): " + $rootScope.Name);
		};

		$scope.setNSD = function(nsd){
			console.log("(setNSD) init");
			$rootScope.NSD = nsd;
			console.log("($rootScope.NSD): " + $rootScope.NSD);
		};
  }])

.controller('registrationStatusCtrl', ['$rootScope', '$scope', '$stateParams', // TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($rootScope, $scope, $stateParams) {

}])

.controller('aboutCtrl', ['$rootScope', '$scope', '$stateParams', '$http', '$cookieStore', // TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($rootScope, $scope, $stateParams, $http, $cookieStore) {

	$scope.aboutPage = true;

}])

.controller('ssidCtrl', ['$rootScope', '$scope', '$stateParams', // TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($rootScope, $scope, $stateParams) {

}])
