// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var db = null;
var emptyString = "";
const KEY_SSID = "ssid";
const KEY_SSID_PASS = "ssid_pass";
const KEY_NODEID = "node_id";
const KEY_ACCESS_TOKEN = "access_token";
const KEY_REFRESH_TOKEN = "refresh_token";
const KEY_USER_EMAIL = "user_email";
const API_URL = "https://api.ardich.com/api/v3";
const UI_URL = "https://mp.modiverse.com/ehub-ui";
//const KEY_GATEWAY_IP = "gateway_ip";
var KEYS = [KEY_SSID, KEY_SSID_PASS,KEY_NODEID, KEY_ACCESS_TOKEN, KEY_REFRESH_TOKEN, KEY_USER_EMAIL];

angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.directives', 'app.services', 'ngCordova', 'ngWebSocket', 'ui.bootstrap'])

.run(function ($ionicPlatform, $cookieStore, $cordovaSQLite, igniteDB, $rootScope, $http, $window, $ionicHistory) {
  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    igniteDB.openDatabase();

    $rootScope.$on('401', function (event,next, nextParams, fromState) {
      console.log('stateChangeStart');
      igniteDB.getKeyValue(KEY_USER_EMAIL).then(function(username){
          igniteDB.getKeyValue(KEY_REFRESH_TOKEN).then(function(refreshToken){
            console.log("refreshToken" + refreshToken);
            if(!refreshToken){
              console.log("refreshToken is empty");
              $window.location.href = "#/signIn";
            }else{
              var userInfo = username.split("\\");
              var email = username;
              var clientId = "";
              if(userInfo.length > 1){
                clientId = userInfo[0];
                email = userInfo[1];
              }
              var authData = "grant_type=refresh_token&refresh_token=" + refreshToken;
              $http({
                method: 'POST',
                data: authData,
                url: API_URL + '/login/oauth',
                headers : {
                   'Content-Type': 'application/x-www-form-urlencoded',
                   'Authorization': 'Basic ' + btoa(clientId + ":")
                },
              }).then(function(response){
                console.log("save" + JSON.stringify(response.data))
                igniteDB.setKeyValue(KEY_ACCESS_TOKEN, response.data.access_token);
                igniteDB.setKeyValue(KEY_REFRESH_TOKEN, response.data.refresh_token);
              }, function(response){
                console.log("ERROR refresh_token " + JSON.stringify(response));
                igniteDB.setKeyValue(KEY_ACCESS_TOKEN, "").then(function(result){
                  igniteDB.setKeyValue(KEY_REFRESH_TOKEN, "").then(function(result){
                    $ionicHistory.clearCache();
                 		$ionicHistory.clearHistory();
                    console.log("Token removed");
                  });
                });
                $window.location.href = "#/signIn";
              });
          }
        })
        }
      );
    });

    $ionicPlatform.registerBackButtonAction(function (event) {
      if ($ionicHistory.currentStateName() === 'home'){
        ionic.Platform.exitApp();
      } else if ($ionicHistory.currentStateName() === 'home'
        || $ionicHistory.currentStateName() === 'signIn'
        || $ionicHistory.currentStateName() === 'signUp'
        || $ionicHistory.currentStateName() === 'forgotPassword') {
        $ionicHistory.goBack();
      } else {
        event.preventDefault();
      }
    }, 100);

  });
})

.filter('unique', function() {
   return function(collection, keyname) {
      var output = [],
          keys = [];

      angular.forEach(collection, function(item) {
          var key = item[keyname];
          if(keys.indexOf(key) === -1) {
              keys.push(key);
              output.push(item);
          }
      });
      return output;
   };
})


/*
 * Handling of 'touchstart' input event was delayed for 110 ms due to main thread being busy.
 * Consider marking event handler as 'passive' to make the page more responive.
 * */
