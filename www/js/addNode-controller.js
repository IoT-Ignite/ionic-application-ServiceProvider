angular.module('app.controllers')

.controller('addNodeCtrl', ['$scope', '$stateParams', '$rootScope', '$cookieStore', '$ionicPopup', 'GatewayService', 'NodeService', '$cordovaSQLite', 'igniteDB', '$window', '$ionicHistory',// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $rootScope, $cookieStore, $ionicPopup, GatewayService, NodeService, $cordovaSQLite, igniteDB, $window, $ionicHistory) {
  $scope.formData = {};
  $scope.alerts = [];
  $scope.logs = [];
  $scope.configureInProgress = false;
  $scope.constructAddNode = function(){
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

      igniteDB.getKeyValue(KEY_NODEID).then(function(pwd){
        $scope.formData.GKEY_NODEID = pwd;
      }
      , function(error){
        $scope.alerts.push({type: 'danger', msg: error });
      } );

		} catch(err){
			$scope.alerts.push({type: 'danger', msg: 'Unknown error. Error detail:' + err });
			$scope.scanCompleted = true;
		}
	}

  $scope.closeAlert = function(index) {
    $scope.alerts.splice(index, 1);
  };

  $scope.closeLog = function(index) {
    $scope.logs.splice(index, 1);
  };

  $scope.connectNode = function(){
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

    igniteDB.setKeyValue(KEY_NODEID, $scope.formData.GKEY_NODEID).then(
      function (result) {
        console.log(KEY_NODEID + " update field: " + JSON.stringify(result));
      },
      function (err) {
        console.log(KEY_NODEID + " insert error: " + JSON.stringify(err));
      }
    );

    $scope.configureInProgress = true;
    $scope.alerts = [];
    $scope.logs = [];
    $scope.deviceId = $cookieStore.get("deviceId");
    NodeService.connectNode($scope.formData.GKEY_SSID, $scope.formData.GKEY_SSID_PASS, $scope.formData.GKEY_NODEID, $rootScope.Name, $scope.deviceId, function(type, message, timeout){
      console.log(type + ": " + message);
      $scope.logs.push({type: type, msg: message , timeout : timeout});
    }, function(node, gateway){
      var message = "Configuration progress of node "+ node + " has been completed for " + gateway;
      console.log(message);
      $scope.alerts.push({type: 'success', msg: message });
      $ionicPopup.show({
  			template: message,
  			title: "Configuration Result",
  			buttons: [
  				{
  					text: "Ok"
  				}
  			]
  		});
      console.log('redirect page');
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $scope.configureInProgress = false;
      $window.location.href = '#/menu/things';
    }, function(message){
      console.log("error: " + JSON.stringify(message));
      $scope.alerts.push({type: 'danger', msg: JSON.stringify(message) });
      $scope.configureInProgress = false;
    });

  };
}])
