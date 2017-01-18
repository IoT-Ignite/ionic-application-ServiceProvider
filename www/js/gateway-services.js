angular.module('app.services')

/* Gateway Service */
.factory('GatewayService', ['igniteDB', '$q', '$http', 'GatewayApiService', '$timeout', 'NetworkService',
 function (igniteDB, $q, $http,  GatewayApiService, $timeout, NetworkService) {
  var unique_Gateway_array = angular.fromJson('[]');

  function getGatewayIpAddr(clientIpAddr) {
    var splitted = clientIpAddr.split(".");
    splitted[3] = 1;
    return splitted.join(".");
  }

  function sendGatewayConfig(timeout, gatewayIp, gatewayConfig, logFunc) {
    var deferred = $q.defer();

      try {
        var ws = new WebSocket("ws://" + gatewayIp + ":12732");
        var configurationReplyMsg = false;
        var deviceInfoMsg = false;
        var deviceInfo = "";
        ws.onopen = function() {
          console.log("Sending configuration " + JSON.stringify(gatewayConfig));
          ws.send(JSON.stringify(gatewayConfig));
          logFunc("success", "Successfully connected to Gateway Socket ", 2000);
        };
        ws.onmessage = function(evt){
          console.log("Message received: " + evt.data);
          var message = JSON.parse(evt.data);
          if(message.type == "DEVICE_INFO"){
            deviceInfo = message;
            deviceInfoMsg = true;
          }else if(message.type == "CONFIGURATION_REPLY" && message.params.result == "SUCCESS"){
            configurationReplyMsg = true;
          } else {
            deferred.reject("Reject error: " + JSON.stringify(message));
            ws.close();
          }
          if(deviceInfoMsg && configurationReplyMsg){
            deferred.resolve(deviceInfo);
            ws.close();
          }
        }
        ws.onerror = function(exception){
          console.log("Could not connect to : " + gatewayIp);
          deferred.reject("Could not connect to : " + gatewayIp);
          ws.close();
        }
      } catch(exception) {
        console.log("Error: " + exception);
        deferred.reject("Reject error: " + exception);
        ws.close();
      }
    setTimeout(function () {
      deferred.reject("Send gateway config timeout");
    }, timeout);

    return deferred.promise;
  }

  function waitDeviceRegistration(tryCount, gatewayId, logFunc, successFunc, failFunc){
    console.log("Api call for gatewayId=" + gatewayId);
    GatewayApiService.getDeviceList(gatewayId, function (data){
        successFunc(gatewayId);
    }, function(data){
        logFunc("warning", "Device registration still in progress. Counter=" + tryCount , 6000);
        if(tryCount > 15){
          failFunc("Gateway could not register to cloud");
        }else{
          //setTimeout(waitDeviceRegistration(++tryCount, gatewayId, logFunc, successFunc, failFunc), 5000);
          $timeout(function() {waitDeviceRegistration(++tryCount, gatewayId, logFunc, successFunc, failFunc)}, 5000);
        }
    })
  }

  function sendGatewayConfiguration(previousSsid, gatewayIp, gatewayConfig, logFunc, successFunc, failFunc){
    var rollBackWifi = function rollBackWifi(error){
      logFunc("danger", error,  "none");
      logFunc("warning", "Reconnecting to " + previousSsid, 2000);
      NetworkService.connectNetwork(previousSsid, function(result){
        logFunc("success", "Re-connected to " + previousSsid, 2000);
        failFunc("Configuration progress could not completed. Error Detail :" + error);
      }, failFunc);
    };
    logFunc("success", "Sending configuration to device", 10000);
    sendGatewayConfig(25000, gatewayIp, gatewayConfig, logFunc).then(function(deviceInfo){
      console.log("device response " + deviceInfo);
      if(deviceInfo.params.lastError){
        logFunc("danger", "Previous registration error " + deviceInfo.params.lastError, 10000);
      }
      logFunc("success", "Configuration delivered to " + deviceInfo.params.deviceId, 5000);
      igniteDB.getKeyValue(KEY_SSID).then(function(ssid){
        igniteDB.getKeyValue(KEY_SSID_PASS).then(function(ssid_pass){
          NetworkService.connectNetwork(previousSsid, function(result){
            logFunc("success", "Re-connected to " + ssid, 2000);
            waitDeviceRegistration(1, deviceInfo.params.deviceId, logFunc, successFunc, failFunc);
          }, rollBackWifi);
        }, rollBackWifi);
      }, rollBackWifi);
    }, rollBackWifi);
  }

  function connectGateway(gateway_ssid, gatewayConfig, logFunc, successFunc, failFunc) {
    logFunc("success", "Connecting to  " + gateway_ssid, 2000);
    var pass = getGatewayPass(gateway_ssid);
    var wifiConfig = NetworkService.formatWPAConfig(gateway_ssid, pass);
    NetworkService.getCurrentWifi(function (currentSsid){
      NetworkService.getMyIpAddr(1000).then(function (currentIp) {
        console.log("Current ip is " + currentIp);
        NetworkService.addNetwork(wifiConfig, function(result){
          NetworkService.connectNetwork(gateway_ssid, function(connectResult){
            logFunc("success", "Successfully connected To " + gateway_ssid, 5000);
            logFunc("success", "Obtaining IP address from " + gateway_ssid, 2000);
            NetworkService.getMyIpAddr2(0, currentIp, logFunc, function (clientIp) {
              logFunc("success", "IP address obtained", 6000);
              var gatewayIp = getGatewayIpAddr(clientIp);
              sendGatewayConfiguration(currentSsid, gatewayIp, gatewayConfig, logFunc, successFunc, failFunc);
            }, failFunc);
          }, failFunc);
        }, failFunc);
      }, failFunc);
    }, failFunc);
  }

  function configureNSDGateway(nsd, appKey, activationCode, profile, logFunc, successFunc, failFunc) {
      //http://192.168.2.12:8080/?appKey=aa&activationCode=aa&resultType=json
      $http({
        method: 'GET',
        params: {"appKey": appKey, "activationCode": activationCode, "modeName": profile, "resultType": "json"},
        headers: {
          'Content-Type' : 'application/x-www-form-urlencoded;'
        },
        url: "http://" + nsd.ipv4Addresses[0] + ":" + nsd.port
      }).then(function(response) {
        logFunc("success", "Configuration sent succesfully", "none");
         waitDeviceRegistration(1, nsd.txtRecord.deviceId, logFunc, successFunc, failFunc);
      }, function(message){
        console.log("Error message : " + message);
      });
  }

  function getGatewayPass(gatewaySSID) {
    var reverse = "";
    gatewaySSID = gatewaySSID.trim();

    for(var i = gatewaySSID.length-1; i>=0; i--) {
      reverse += gatewaySSID[i];
    }
    return reverse.trim();
  }

  function registerGateway(ssid, pass, profile, gateway, logFunc, successFunc, failFunc) {
    GatewayApiService.getQrCode(function (success) {
          if(success.status == 200){
            ssid = (ssid == null) ? null : ssid.trim();
            pass = (pass == null) ? null : pass.trim();
            console.log(success.data);
            NetworkService.getMyIpAddr(100).then(function(clientIp){
              var config = {"type" : "CONFIGURATION", "params":{"ssid": ssid,"ssidPassword":pass,"appKey":success.data.appKey, "activationCode" : success.data.activationCode, "profileName" : profile, "previousIp" : clientIp, "logPort" : 12734}};
              connectGateway(gateway, config, logFunc, successFunc, failFunc)
            }, failFunc);
          }else{
            failFunc("Unknown response code " + success.status);
          }
        }, function(error) {
          if(error.status == 404){
  					failFunc("End user couldn't find");
  				}else{
  					failFunc
  				}
        });
      }

      function registerNSDGateway(profile, nsd, logFunc, successFunc, failFunc) {
        GatewayApiService.getQrCode(function (success) {
              if(success.status == 200){
                console.log(success.data);
                configureNSDGateway(nsd, success.data.appKey, success.data.activationCode, profile, logFunc, successFunc, failFunc)
              }else{
                failFunc("Unknown response code " + success.status);
              }
            }, function(error) {
              if(error.status == 404){
      					failFunc("End user couldn't find");
      				}else{
      					failFunc
      				}
            });
          }
  return {
    registerGateway: function (ssid, pass, profile, gateway, logFunc, successFunc, failFunc) {
      registerGateway(ssid, pass, profile, gateway, logFunc, successFunc, failFunc);
    },
    registerNSDGateway: function (profile, nsd, logFunc, successFunc, failFunc) {
      registerNSDGateway(profile, nsd, logFunc, successFunc, failFunc);
    }
  };

}])
