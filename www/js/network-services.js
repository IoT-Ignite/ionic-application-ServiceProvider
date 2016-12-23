angular.module('app.services')

/* Network Service */
.factory('NetworkService', ['$q', function ($q) {


  function addNetwork(wifiConfig, success, fail){
    WifiWizard.addNetwork(wifiConfig, success, fail)
  }

  function connectNetwork(ssid, success, fail){
    WifiWizard.connectNetwork(ssid, success, fail)
  }

  function filterWifi(wifi, filter){
    var wifi_array = [];
    var igniteWifiArray = [];
    for (var i = 0; i < wifi.length; i++) {
      wifi_array.push(wifi[i].SSID);
    }
    console.log(wifi_array);
    for (var i = 0; i < wifi_array.length; i++) {
      if (wifi_array[i].indexOf(filter) >= 0) {
        igniteWifiArray.push(wifi_array[i]);
      }
    }
    return igniteWifiArray;
  }

  function getCurrentWifi(scb, ecb){
      console.log("current wifi is running");

      WifiWizard.getCurrentSSID(function(wifi){
        if(wifi.length > 0){
          wifi = wifi.substring(1, wifi.length-1);
        }
        scb(wifi);
      }, ecb);
  }

  function listWifi(scb, ecb){
      WifiWizard.startScan(function(){
        WifiWizard.getScanResults(scb, ecb);
      }, ecb);
  }

  function getMyIpAddr(delay) {
   var deferred = $q.defer();

   setTimeout(function () {
     networkinterface.getIPAddress(function (result) {
       if(result){
         console.log("IP address is " + result);
         deferred.resolve(result);
       }else{
         console.log("getMy Ip Fail" + result);
         deferred.reject("Client IP could not detected. error:");
       }
     }, function (error){
       console.log("Error get my ip address " + error);
       deferred.resolve("");
     });
    }, delay);

    return deferred.promise;
  }

  function getMyIpAddr2(tryCount, oldIp, logFunc, successFunc, failFunc){
    console.log("getMyIpAddr is running " + tryCount);
    getMyIpAddr(2000).then(function (clientIp){
        console.log("current ip " + clientIp);
        if(clientIp != "" && oldIp != clientIp){
          successFunc(clientIp);
        } else{
          if(tryCount > 30){
            console.log("Could not obtain IP address from gateway");
            failFunc("Could not obtain IP address from gateway");
          }else{
            logFunc("warning", "Trying to obtain IP address", 1000);
            console.log("Old Ip " + oldIp + " new Ip " + clientIp);
            var x = tryCount +1;
            getMyIpAddr2(x, oldIp, logFunc, successFunc, failFunc);
          }
        }
      }, failFunc);
  }

  function formatWPAConfig(ssid, pass) {
    return WifiWizard.formatWPAConfig(ssid, pass);
  }

  return {
    addNetwork: function(wifiConfig, success, fail) {
      return addNetwork(wifiConfig, success, fail);
    },
    connectNetwork: function(ssid, success, fail) {
      return connectNetwork(ssid, success, fail);
    },
    listWifi: function (scb, ecb) {
      return listWifi(scb, ecb);
    },
    filterWifi: function (wifi_array, filter) {
      return filterWifi(wifi_array, filter);
    },
    getCurrentWifi: function (scb, ecb) {
      return getCurrentWifi(scb, ecb);
    },
    getMyIpAddr: function (delay) {
      return getMyIpAddr(delay);
    },
    getMyIpAddr2: function (tryCount, oldIp, logFunc, successFunc, failFunc) {
      return getMyIpAddr2(tryCount, oldIp, logFunc, successFunc, failFunc);
    },
    formatWPAConfig: function (ssid, pass) {
      return formatWPAConfig(ssid, pass);
    }
  };

}])
