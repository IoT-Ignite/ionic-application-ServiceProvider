angular.module('app.services', ['ngCordova'])

.service('igniteDB', ['$ionicPlatform', '$cordovaSQLite', '$q', function ($ionicPlatform, $cordovaSQLite, $q) {
  return {
    openDatabase: function () {
      console.log("igniteDB.openDatabase called");

      /* Ionic Serve syntax */
      if(window.cordova) {
        db = $cordovaSQLite.openDB({name: 'ignition.db', location: 'default'});
      } else {
        var dbSize = 5 * 1024 * 1024; // 5mb
        db = window.openDatabase("ignition.db", "1.0", "app", dbSize);
      }
/* Ionic Serve syntax */
      //db = $cordovaSQLite.openDB({name: 'ignition.db', location: 'default'});

      $cordovaSQLite.execute(db, 'CREATE TABLE ThingConfigs(key TEXT PRIMARY KEY, value TEXT)').then(
        function (result) {
          console.log("Create table result: " + JSON.stringify(result));
          KEYS.forEach(
            function (key) {
              $cordovaSQLite.execute(db, 'INSERT OR REPLACE INTO ThingConfigs (key, value) VALUES (?, COALESCE((SELECT value FROM ThingConfigs WHERE key=?), ?))',
                [key, key, emptyString]).then(
                function (result) {
                  console.log(key + " insert result: " + JSON.stringify(result));
                },
                function (err) {
                  console.log(key + " insert error: " + JSON.stringify(err));
                }
              );
            }
          );
        },
        function (error) {
          console.log("Create table error: " + JSON.stringify(error));
          KEYS.forEach(
            function (key) {
              $cordovaSQLite.execute(db, 'SELECT value FROM ThingConfigs WHERE key=?', [key]).then(
                function (result) {
                  console.log(key + " select result: " + JSON.stringify(result));
                  if (result.rows.length > 0)
                    console.log(key + " value: " + result.rows.item(0).value);
                },
                function (err) {
                  console.log(key + " select error: " + JSON.stringify(err));
                }
              );
            }
          );
        }
      );
    },
    getKeyValue: function (key) {
      var deferred = $q.defer();

      $cordovaSQLite.execute(db, 'SELECT value FROM ThingConfigs WHERE key=?', [key]).then(
        function (result) {
          var retval = "";
          console.log(key + " select result: " + JSON.stringify(result));
          if (result.rows.length > 0) {
            for(var i = 0; i < result.rows.length; i++) {
              console.log(key + "[" + i + "] value: " + result.rows.item(i).value);
            }
            retval = result.rows.item(0).value;
          }

          deferred.resolve(retval);
        },
        function (error) {
          console.log(key + " select error: " + JSON.stringify(error));
          deferred.reject(error);
        }
      );

      return deferred.promise;
    },
    setKeyValue: function (key, value) {
      var deferred = $q.defer();
      console.log("(setKeyValue)key : [" + key +"]: [" + value + "]");
      $cordovaSQLite.execute(db, 'INSERT OR REPLACE INTO ThingConfigs (key, value) VALUES (?, ?)',
        [key, value]).then(
        function (result) {
          console.log(key + " insert result: " + JSON.stringify(result));
          console.log("(setKeyValue)key : [" + key +"]: [" + value + "]");
          deferred.resolve(result);
        },
        function (error) {
          console.log(key + " insert error: " + JSON.stringify(error));
          deferred.reject(error)
        }
      );

      return deferred.promise;
    }
  }
}])

.factory('LogoutService', ['igniteDB', '$q', '$http', function (igniteDB, $q, $http) {
  function logout(scb, ecb){
    igniteDB.setKeyValue(KEY_ACCESS_TOKEN, "").then(function(result){
      console.log("key access token removed");
      igniteDB.setKeyValue(KEY_REFRESH_TOKEN, "").then(function(result){
        console.log("key access token removed2");
        scb();
      },ecb);
    },ecb);
  }
  return {
    logout: function (scb, ecb) {
      return logout(scb, ecb);
    }
  };
 }])
