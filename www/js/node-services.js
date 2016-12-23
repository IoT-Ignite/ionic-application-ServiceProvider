angular.module('app.services')

/* Thing Service */
.factory('NodeService', ['$q', 'NetworkService', '$http', 'GatewayApiService', function ($q, NetworkService, $http, GatewayApiService) {
  var unique_array = angular.fromJson('[]');
  var defIpAddr = "192.168.4.1";
  var defIpPort = "9999";
  var defWebServerUrl = "http://" + defIpAddr + "/node-configurations";

  /* TCP connection */
  function arrayBuffer2str(buf) {
    var str = '';
    var ui8 = new Uint8Array(buf);
    for (var i = 0; i < ui8.length; i++) {
      str = str + String.fromCharCode(ui8[i]);
    }
    return str;
  }

  function str2arrayBuffer(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0; i < str.length; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  function waitNodeRegistration(tryCount, nodeId, gatewayId, logFunc, successFunc, failFunc){
    console.log("Api call for gatewayId= " + gatewayId);
    GatewayApiService.getThingsList(gatewayId, function (success){
      var nodes = success.data.extras.nodes;
      console.log("nodes " + nodes);
      for (var i = 0; i < nodes.length; i++) {
        if(nodes[i].nodeId == nodeId) {
          console.log("Node has been found on the list");
          successFunc(nodeId, gatewayId);
          return;
        }
      }
      if (tryCount > 12){
        failFunc("Node could not registered to gateway");
        return;
      } else {
        setTimeout(function() {
          logFunc("warning", "Node registration still in progress. Counter=" + tryCount , 9000);
          waitNodeRegistration(++tryCount, nodeId, gatewayId, logFunc, successFunc, failFunc)
        }, 8000);
      }
    }, function(data){
        logFunc("warning", "Node registration still in progress. Counter=" + tryCount , 9000);
        if (tryCount > 12){
          failFunc("Node could not registered to gateway");
          return;
        } else {
          setTimeout(function() {
              waitNodeRegistration(++tryCount, nodeId, gatewayId, logFunc, successFunc, failFunc)
          }, 8000);
        }
    })
  }

  function configureRemoteNode(nodeId, config, deviceId, logFunc, successFunc, failFunc) {

      logFunc("success", "Opening socket to node", "5000");
      chrome.sockets.tcp.create(function (createInfo) {
        logFunc("success", "Socket created", "5000");
        console.log("Socket created : " + JSON.stringify(createInfo));
        console.log("tcp.connect(" + createInfo.socketId + "," + defIpAddr +"," +defIpPort + ")");
        chrome.sockets.tcp.connect(createInfo.socketId, defIpAddr, defIpPort, function (result) {
          console.log("(chrome.sockets.tcp.connect) result : " + result);
          if(result == -104){
            failFunc("Could not connect to node");
            return;
          }
          if (result === 0) {
            logFunc("warning", "Socket connection established to node", "5000");
            var data2send = str2arrayBuffer(config);
            chrome.sockets.tcp.onReceive.addListener(function (data) {
              var strData = arrayBuffer2str(data.data);
              console.log("on receive " + strData + " from socket:" + data.socketId);
              logFunc("warning", "TCP/IP data received : " + strData, "5000");
              try {
                var jsData = JSON.parse(strData);
                console.log(jsData);
                console.log("Type: " + jsData.type + "Code: " + jsData.code + " Message: " + jsData.message);
                if(jsData.type == 0 && jsData.code == "111") {
                  logFunc("warning", "Configuration delivered to node " + nodeId, "5000");
                  setTimeout(function() {
                    waitNodeRegistration(1, nodeId, deviceId, logFunc, successFunc, failFunc);
                  }, 5000);
                } else {
                  logFunc("warning", "Previous Error : " + jsData.message, "5000");
                }
              } catch(e) {
                console.log("error in parse data " + e);
              }
            });

            chrome.sockets.tcp.onReceiveError.addListener(function(info) {
              logFunc("danger", "Received error " + info.resultCode, "none");
            });
            chrome.sockets.tcp.send(createInfo.socketId, data2send, function (sendInfo) {
              if (sendInfo.resultCode >= 0) {
                logFunc("success", "Send configuration succesfully" + sendInfo.resultCode, "none");
                //chrome.sockets.tcp.disconnect(createInfo.socketId);
                //chrome.sockets.tcp.close(createInfo.socketId);
              } else {
                failFunc("Send data failed./nresultCode : " + sendInfo.resultCode + "/nSent Data : " + data2send);
              }
            });
          } else {
              failFunc("Could not connect to : " + defIpAddr + ":" + defIpPort + ", result : " + result);
          }
        });

      });

  }

  function configureRemoteNodeViaWebServer(previousSsid, nodeId, config, deviceId, logFunc, successFunc, failFunc) {
      var rollBackWifi = function rollBackWifi(error){
        logFunc("danger", error,  "none");
        logFunc("warning", "Reconnecting to " + previousSsid, 2000);
        NetworkService.connectNetwork(previousSsid, function(result){
          logFunc("success", "Re-connected to " + previousSsid, 2000);
          failFunc("Configuration progress could not completed. Error Detail :" + error);
        }, failFunc);
      };
      var configurations = "node-configurations=" + config;
      $http({
        method: 'POST',
        data: configurations,
        headers: {
          'Content-Type' : 'application/x-www-form-urlencoded;'
        },
        url: defWebServerUrl
      }).then(function(response) {
        logFunc("success", "Configuration sent succesfully", "none");
         NetworkService.connectNetwork(previousSsid, function(result){
           logFunc("success", "Re-connected to " + previousSsid, 2000);
             waitNodeRegistration(1, nodeId, deviceId, logFunc, successFunc, failFunc);
         }, rollBackWifi);
      }, function(message){
        console.log("Error message : " + message);
        rollBackWifi(message);
      });
  }

  function getNodeConfig (ssid, pass, gatewayId, nodeId, currentIp) {
    var config = "";
    ssid = (ssid == null) ? null : ssid.trim();
    pass = (pass == null) ? null : pass.trim();
    nodeId = (nodeId == null) ? null : nodeId.trim();
    config = ssid + "~" + pass + "~" + gatewayId + "~" + nodeId + "~" + currentIp;
    return config;
  }

  function getNodeConfigJson (ssid, pass, gatewayId, nodeId, currentIp) {
    var config = "";
    ssid = (ssid == null) ? null : ssid.trim();
    pass = (pass == null) ? null : pass.trim();
    nodeId = (nodeId == null) ? null : nodeId.trim();
    config = '{"node-configurations":{"nodeId":"' + nodeId + '","gatewayId":"' + gatewayId + '","ssid":"' + ssid + '","password":"' + pass + '"}}';
    return config;
  }

  function connectNode(ssid, pass, nodeId, name, deviceId, logFunc, successFunc, failFunc) {

    NetworkService.getMyIpAddr(100).then(function(currentIp){
       var config = getNodeConfig(ssid, pass, deviceId, nodeId, currentIp);
       var wifiConfig = WifiWizard.formatWifiConfig(name, "", "");
       console.log("(configureNode) Node Config : " + config);
       console.log("Wifi Config : " + JSON.stringify(wifiConfig));
       NetworkService.addNetwork(wifiConfig, function(result){
         NetworkService.connectNetwork(name, function(connectResult){
           logFunc("success", "Successfully connected To " + name, 5000);
           logFunc("success", "Obtaining IP address from " + name, 2000);
           NetworkService.getMyIpAddr2(0, currentIp,  logFunc, function (clientIp) {
             logFunc("success", "IP address obtained. IP =" + clientIp, 6000);
             configureRemoteNode(nodeId, config, deviceId, logFunc, successFunc, failFunc);
         }, failFunc);
         }, failFunc);
       }, failFunc);
     }, function (err) {
      console.log("Could not get Ip: " + err);
    });
  }

  function connectNodeViaWebServer(ssid, pass, nodeId, name, deviceId, logFunc, successFunc, failFunc) {
    NetworkService.getCurrentWifi(function (currentSsid){
      NetworkService.getMyIpAddr(100).then(function(currentIp){
        var config = getNodeConfigJson(ssid, pass, deviceId, nodeId);
        var wifiConfig = WifiWizard.formatWifiConfig(name, "", "");
        console.log("(configureNode) Node Config : " + config);
        console.log("Wifi Config : " + JSON.stringify(wifiConfig));
        NetworkService.addNetwork(wifiConfig, function(result){
         NetworkService.connectNetwork(name, function(connectResult){
           logFunc("success", "Successfully connected To " + name, 5000);
           logFunc("success", "Obtaining IP address from " + name, 2000);
           NetworkService.getMyIpAddr2(0, currentIp,  logFunc, function (clientIp) {
             logFunc("success", "IP address obtained. IP =" + clientIp, 6000);
             configureRemoteNodeViaWebServer(currentSsid, nodeId, config, deviceId, logFunc, successFunc, failFunc);
           }, failFunc);
          }, failFunc);
        }, failFunc);
      }, function (err) {
        console.log("Could not get Ip: " + err);
      });
    }, failFunc);
  }

  return {
    connectNode: function (ssid, pass, nodeId, name, deviceId, logFunc, successFunc, failFunc) {
        connectNodeViaWebServer(ssid, pass, nodeId, name, deviceId, logFunc, successFunc, failFunc);
    }
  };

}])
