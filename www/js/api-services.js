angular.module('app.services')


.factory('AuthorizationService', ['igniteDB', '$q', '$http', function (igniteDB, $q, $http) {
  function login(username, password, scb, ecb){
    var userInfo = username.split("\\");
    var email = username;
    var clientId = "";
    if(userInfo.length > 1){
      clientId = userInfo[0];
      email = userInfo[1];
    }
    console.log("Email" + email);
    console.log("clientId" + clientId);
    var authData = "grant_type=password&username=" + email + "&password=" + password;
    $http({
      method: 'POST',
      data: authData,
      url: API_URL + '/login/oauth',
      headers : {
         'Content-Type': 'application/x-www-form-urlencoded',
         'Authorization': 'Basic ' + btoa(clientId + ":")
      },
    }).then(function(response){
      igniteDB.setKeyValue(KEY_ACCESS_TOKEN, response.data.access_token).then(function(result){
        igniteDB.setKeyValue(KEY_REFRESH_TOKEN, response.data.refresh_token).then(function(result){
          igniteDB.setKeyValue(KEY_USER_EMAIL, username).then(function(result){
            scb(response.data);
          }, ecb)
        }, ecb)
      }, ecb);
    }, function(response){
      ecb(response);
    });
  }

  function changePassword(currentPassword, newPassword, scb, ecb){
    igniteDB.getKeyValue(KEY_ACCESS_TOKEN).then(
      function (accessToken) {
        $http({
          method: 'POST',
          data: {'currentPwd': currentPassword, 'newPwd': newPassword},
          url: API_URL + '/sysuser/password/change',
          headers : {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken
          },
        }).then(scb, ecb);
      }, ecb);

  }

  function forgetPassword(username, fromAlias, url, mailSender, scb, ecb){
    var userInfo = username.split("\\");
    var email = username;
    var clientId = "";
    if(userInfo.length > 1){
      clientId = userInfo[0];
      email = userInfo[1];
    }
    console.log("Email" + email);
    console.log("clientId" + clientId);
    $http({
      method: 'POST',
      data:{
         "fromAlias": fromAlias,
         "mail": username,
         "url": url,
         "mailSender": mailSender
      },
      url: API_URL + '/login/password/forget',
      headers : {
         'Content-Type': 'application/json',

      },
    }).then(scb , ecb);
  }

  return {
    login: function (username, password, scb, ecb) {
      return login(username, password, scb, ecb);
    },
    forgetPassword: function (username, fromAlias, url, mailSender, scb, ecb) {
      return forgetPassword(username, fromAlias, url, mailSender, scb, ecb);
    },
    changePassword : function (currentPassword, newPassword, scb, ecb){
      return changePassword(currentPassword, newPassword, scb, ecb);
    }
  };
 }])

 .factory('IgniteApiService', ['igniteDB', '$q', '$http', function (igniteDB, $q, $http) {

   function createRestrictedUser(firstName, lastName, mail, password, brand, profileName, scb, ecb){
     var url = API_URL + "/public/create-restricted-user";
     try{
       $http({
          method: 'POST',
          data:{
             "firstName": firstName,
             "lastName": lastName,
             "mail": mail,
             "password": password,
             "profileName": profileName,
             "brand": brand
            },
          url: url,
          headers: {
              'Content-Type': 'application/json'
          	},
        	}).then(scb, ecb);
     }catch(exception){
       console.log('Can not call api. Error ' + exception);
       ecb;
     }
   }
   return {
     createRestrictedUser: function (firstName, lastName, mail, password, brand, profileName, scb, ecb) {
       return createRestrictedUser(firstName, lastName, mail, password, brand, profileName, scb, ecb);
     }
   };
  }])

.factory('GatewayApiService', ['igniteDB', '$q', '$http', function (igniteDB, $q, $http) {

    function getDeviceList(deviceId, scb, ecb){
      var url = API_URL + "/device/summary?page=0&size=100";
      console.log("GetDeviceList " + deviceId);
      if(!!deviceId){
        url = url + "&device=" + deviceId;
        console.log("GetDeviceList url" + url);
      }
      try{
        igniteDB.getKeyValue(KEY_ACCESS_TOKEN).then(
          function (accessToken) {
            $http({
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + accessToken
              },
              url: url
            }).then(scb, ecb);
          }, ecb);
      }catch(exception){
        console.log('Can not call api. Error ' + exception);
        ecb;
      }
    }

    function getQrCode(scb, ecb) {
        igniteDB.getKeyValue(KEY_ACCESS_TOKEN).then(
          function (accessToken) {
            $http({
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + accessToken
              },
              url: API_URL + '/ignite/default-qr-attributes'
            }).then(scb, ecb);
          }, ecb);
     }

     function updateDeviceLabel(deviceCode, label, scb, ecb) {
         igniteDB.getKeyValue(KEY_ACCESS_TOKEN).then(
           function (accessToken) {
             $http({
               method: 'PUT',
               data:{
 	               "label": label
 	              },
               headers: {
                 'Authorization': 'Bearer ' + accessToken
               },
               url: API_URL + '/device/' + deviceCode + '/label'
             }).then(scb, ecb);
           }, ecb);
     }

     function pushDeviceLabel(deviceCode, scb, ecb) {
        igniteDB.getKeyValue(KEY_ACCESS_TOKEN).then(
          function (accessToken) {
            $http({
              method: 'POST',
              data:{},
              headers: {
                'Authorization': 'Bearer ' + accessToken
              },
              url: API_URL + '/device/' + deviceCode + '/control/pushTenantDeviceInfo'
            }).then(scb, ecb);
          }, ecb);
    }

    function pushUnregisterNodeThing(deviceId, nodeId, thingId, scb, ecb) {
       igniteDB.getKeyValue(KEY_ACCESS_TOKEN).then(
         function (accessToken) {
           $http({
             method: 'POST',
             data:{
               "params": [
                    {
                      "nodeId": nodeId,
                      "sensorId": thingId
                    }
               ]
             },
             headers: {
               'Authorization': 'Bearer ' + accessToken
             },
             url: API_URL + '/device/' + deviceId + '/control/unregister-node-thing'
           }).then(scb, ecb);
         }, ecb);
    }

    function getGatewayDetail (deviceCode, scb, ecb) {
       igniteDB.getKeyValue(KEY_ACCESS_TOKEN).then(
         function (accessToken) {
           $http({
             method: 'GET',
             headers: {
               'Authorization': 'Bearer ' + accessToken
             },
             url: API_URL + '/device/' + deviceCode
           }).then(scb, ecb);
         }, ecb);
    }

    function getThingsList (deviceId, scb, ecb) {
       igniteDB.getKeyValue(KEY_ACCESS_TOKEN).then(
         function (accessToken) {
           $http({
             method: 'GET',
             headers: {
               'Authorization': 'Bearer ' + accessToken
             },
             url: API_URL + '/device/' + deviceId + "/device-node-inventory"
           }).then(scb, ecb);
         }, ecb);
    }

    function getProfileList (scb, ecb) {
       igniteDB.getKeyValue(KEY_ACCESS_TOKEN).then(
         function (accessToken) {
           $http({
             method: 'GET',
             headers: {
               'Authorization': 'Bearer ' + accessToken
             },
             url: API_URL + "/profile/list"
           }).then(scb, ecb);
         }, ecb);
    }

   return {
     getDeviceList: function (device, scb, ecb) {
       return getDeviceList(device, scb, ecb);
     },
     getQrCode: function (scb, ecb) {
       return getQrCode(scb, ecb);
     },
     getGatewayDetail: function(deviceCode, scb, ecb) {
       return getGatewayDetail(deviceCode, scb, ecb);
     },
     getThingsCount: function(deviceId, scb, ecb) {
       return getThingsCount(deviceId, scb, ecb);
     },
     getThingsList: function(deviceId, scb, ecb) {
       return getThingsList(deviceId, scb, ecb);
     },
     getProfileList: function(scb, ecb) {
       return getProfileList(scb, ecb);
     },
     updateDeviceLabel: function(deviceCode, label, scb, ecb) {
       return updateDeviceLabel(deviceCode, label, scb, ecb);
     },
     pushDeviceLabel: function(deviceCode, scb, ecb) {
       return pushDeviceLabel(deviceCode, scb, ecb);
     },
     pushUnregisterThing: function(deviceId, nodeId, thingId, scb, ecb) {
       return pushUnregisterNodeThing(deviceId, nodeId, thingId, scb, ecb);
     },
     pushUnregisterNode: function(deviceId, nodeId, scb, ecb) {
       return pushUnregisterNodeThing(deviceId, nodeId, null, scb, ecb);
     }
   };
 }])
 .factory('AuthInterceptor', ['$rootScope', '$q', function ($rootScope,  $q) {
   return {
     responseError: function (response) {
       if(response.status == "401"){
         console.log('UnAuthorized Access');
         $rootScope.$broadcast("401");
         return $q.reject('User token expired, please try again!!!');
       } else if(response.status == "0"){
         console.log('Unknown Error');
         return $q.reject('Please check your internet connection!');
       }else{
         return $q.reject(response);
       }
     }
   };
 }])

 .config(function ($httpProvider) {
   $httpProvider.interceptors.push('AuthInterceptor');
 });
