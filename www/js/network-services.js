angular.module('app.services')

/* Network Service */
.factory('NetworkService', ['$q', function ($q) {
  var zeroconf = cordova.plugins.zeroconf;
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

  function watch(type, domain, delay) {
    var deferred = $q.defer();

    var igniteNSDArray = [];
    console.log('watch');
    zeroconf.watch(type, domain, function(result) {
      var action = result.action;
      var service = result.service;
      /* service : {
          'domain' : 'local.',
          'type' : '_http._tcp.',
          'name': 'Becvert\'s iPad',
          'port' : 80,
          'hostname' : 'ipad-of-becvert.local',
          'ipv4Addresses' : [ '192.168.1.125' ],
          'ipv6Addresses' : [ '2001:0:5ef5:79fb:10cb:1dbf:3f57:feb0' ],
          'txtRecord' : {
              'foo' : 'bar'
          }
      } */
      if (action == 'added') {
          igniteNSDArray.push(service);
          console.log('service added', service);
      }
    });

     setTimeout(function () {
       //try
         unwatch(type, domain);
         close();
         deferred.resolve(igniteNSDArray);
     }, delay);

    return deferred.promise;
  }

  function watch2(type, domain) {

    var igniteNSDArray = [];
    console.log('watch');
    zeroconf.watch(type, domain, function(result) {
      var action = result.action;
      var service = result.service;
      /* service : {
          'domain' : 'local.',
          'type' : '_http._tcp.',
          'name': 'Becvert\'s iPad',
          'port' : 80,
          'hostname' : 'ipad-of-becvert.local',
          'ipv4Addresses' : [ '192.168.1.125' ],
          'ipv6Addresses' : [ '2001:0:5ef5:79fb:10cb:1dbf:3f57:feb0' ],
          'txtRecord' : {
              'foo' : 'bar'
          }
      } */
      if (action == 'added') {
          console.log('service added', service);
      }
    });

  }

  function unwatch(type, domain) {
    zeroconf.unwatch(type, domain);
  }

  function close() {
    zeroconf.close();
  }

  function getHostName(successFunc) {
    zeroconf.getHostname(successFunc);
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
    },
    watch: function(type, domain, delay) {
      return watch(type, domain, delay);
    },
    watch2: function(type, domain) {
      watch2(type, domain);
    },
    unwatch: function(type, domain) {
      unwatch(type, domain);
    },
    close: function() {
      close();
    },
    getHostName: function(successFunc) {
      getHostName(successFunc);
    }
  };

}])
