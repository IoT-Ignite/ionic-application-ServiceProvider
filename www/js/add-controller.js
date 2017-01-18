angular.module('app.controllers')

.controller('addGatewayCtrl', ['$scope', '$stateParams', '$rootScope', '$cookieStore', '$ionicPopup', 'GatewayService', 'NetworkService', 'GatewayApiService', '$cordovaSQLite', 'igniteDB', '$window', '$ionicHistory',// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $rootScope, $cookieStore, $ionicPopup, GatewayService, NetworkService, GatewayApiService,  $cordovaSQLite, igniteDB, $window, $ionicHistory) {
  $scope.formData = {};

  $scope.constructAddGateway = function(){
		$scope.formData = {};
		$scope.alerts = [];
    $scope.logs = [];
    $scope.configureInProgress = false;
		try{
      igniteDB.getKeyValue(KEY_SSID).then(function(ssid){
        console.log('ssid ' + ssid);
        if(ssid.length == 0){
          NetworkService.getCurrentWifi(function(wifi){
              $scope.formData.GKEY_SSID = wifi;
          }, function(error){
              $scope.alerts.push({type: 'danger', msg: error });
          });
        }else{
          $scope.formData.GKEY_SSID = ssid;
        }
      }
      , function(error){
        $scope.alerts.push({type: 'danger', msg: error });
      } );
      igniteDB.getKeyValue(KEY_SSID_PASS).then(function(pwd){
        $scope.formData.GKEY_SSID_PASS = pwd;
      }
      , function(error){
        $scope.alerts.push({type: 'danger', msg: error });
      } );
		} catch(err){
			$scope.alerts.push({type: 'danger', msg: 'Unknown error. Error detail:' + err });
			$scope.scanCompleted = true;
		}
	}

  GatewayApiService.getProfileList(function(success) {
    var profiles = success.data.extras.profiles;

    $scope.profiles = [];
    for (var i = 0; i < profiles.length; i++) {
      $scope.profiles[i] = {
        name: profiles[i].name
      };
    }
    if($scope.profiles.length == 0) {
      $scope.alerts.push({type: 'warning', msg: "Could not find any profile" , timeout : "2000"});
    }
  }, function (error) {
    if(error.status == 404){
      console.log("There is no profile");
      $scope.alerts.push({type: 'warning', msg: "There is no profile"});
      $scope.profiles = [];
    }else{
      console.log("Error" + error);
      $scope.alerts.push({type: 'warning', msg: "Error:" +  JSON.stringify(error)});
    }
  })

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.closeLog = function(index) {
    $scope.logs.splice(index, 1);
  };

  $scope.connectToGateway = function(){
    console.log("(connectToGateway) init : " + $rootScope.Name);

    igniteDB.setKeyValue(KEY_SSID, $scope.formData.GKEY_SSID).then(
      function (result) {
        console.log(KEY_SSID + " update field: " + JSON.stringify(result));
      },
      function (err) {
        console.log(KEY_SSID + " insert error: " + JSON.stringify(err));
      }
    );

    igniteDB.setKeyValue(KEY_SSID_PASS, $scope.formData.GKEY_SSID_PASS).then(
      function (result) {
        console.log(KEY_SSID_PASS + " update field: " + JSON.stringify(result));
      },
      function (err) {
        console.log(KEY_SSID_PASS + " insert error: " + JSON.stringify(err));
      }
    );
    $scope.configureInProgress = true;
    $scope.alerts = [];
    $scope.logs = [];
    GatewayService.registerGateway($scope.formData.GKEY_SSID, $scope.formData.GKEY_SSID_PASS, $scope.formData.PROFILE_NAME, $rootScope.Name, function(type, message, timeout){
      console.log(type + ": " + message);
      $scope.logs.push({type: type, msg: message , timeout : timeout});
    }, function(gatewayId){
      var message = "Configuration progress has been completed for " + gatewayId;
      console.log(message);
      $scope.alerts.push({type: 'success', msg: message });
      $ionicPopup.show({
  			template: message,
  			title: "Registration Result",
  			buttons: [
  				{
  					text: "Ok"
  				}
  			]
  		});
      console.log('redirect page');
      $cookieStore.put('deviceId', gatewayId);
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $scope.configureInProgress = false;
      $window.location.href = '#/menu/gatewaydetail';
    }, function(message){
      console.log("error: " + message);
      $scope.alerts.push({type: 'danger', msg: message });
      $scope.configureInProgress = false;
    });

  };

  $scope.connectToNSDGateway = function(){
    console.log("(connectToNSDGateway) init : " + $rootScope.NSD.txtRecord.deviceId);

    $scope.configureInProgress = true;
    $scope.alerts = [];
    $scope.logs = [];
    GatewayService.registerNSDGateway($scope.formData.PROFILE_NAME, $rootScope.NSD, function(type, message, timeout){
      console.log(type + ": " + message);
      $scope.logs.push({type: type, msg: message , timeout : timeout});
    }, function(gatewayId){
      var message = "Configuration progress has been completed for " + gatewayId;
      console.log(message);
      $scope.alerts.push({type: 'success', msg: message });
      $ionicPopup.show({
        template: message,
        title: "Registration Result",
        buttons: [
          {
            text: "Ok"
          }
        ]
      });
      console.log('redirect page');
      $cookieStore.put('deviceId', gatewayId);
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $scope.configureInProgress = false;
      $window.location.href = '#/menu/gatewaydetail';
    }, function(message){
      console.log("error: " + message);
      $scope.alerts.push({type: 'danger', msg: message });
      $scope.configureInProgress = false;
    });

  };
}])
