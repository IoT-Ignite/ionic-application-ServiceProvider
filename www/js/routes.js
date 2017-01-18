angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('menu', {
    url: '/menu',
    templateUrl: 'templates/menu.html',
    abstract:true
  })

  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html'
  })

  .state('signIn', {
    url: '/signin',
    templateUrl: 'templates/signIn.html'
  })

  .state('signUp', {
    url: '/signup',
    templateUrl: 'templates/signUp.html'
  })

  .state('forgotPassword', {
    url: '/forgot',
    templateUrl: 'templates/forgotPassword.html'
  })

  // Menu Pages
  .state('menu.profile', {
    url: '/profile',
    views: {
      'side-menu21': {
        templateUrl: 'templates/profile.html'
      }
    }
  })

  .state('menu.gateways', {
    cache: false,
    url: '/gateways',
    views: {
      'side-menu21': {
        templateUrl: 'templates/gateways.html'
      }
    }
  })

  .state('menu.things', {
    cache: false,
    url: '/things',
    views: {
      'side-menu21': {
        templateUrl: 'templates/things.html',
        controller: 'thingsCtrl'
      }
    }
  })

  .state('menu.gatewayDetail',{
    cache: false,
    url: '/gatewaydetail',
    views: {
      'side-menu21': {
        templateUrl: 'templates/gatewayDetail.html',
        controller: 'gatewayDetailCtrl'
      }
    }
  })

  .state('menu.addGateway', {
    url: '/addgateway',
    views: {
      'side-menu21': {
        templateUrl: 'templates/addGateway.html',
        controller: 'addGatewayCtrl'
      }
    }
  })

  .state('menu.addNSDGateway', {
    url: '/addNSDgateway',
    views: {
      'side-menu21': {
        templateUrl: 'templates/addNSDGateway.html',
        controller: 'addGatewayCtrl'
      }
    }
  })

  .state('menu.addNode', {
    cache: false,
    url: '/addgateway',
    views: {
      'side-menu21': {
        templateUrl: 'templates/addNode.html',
        controller: 'addNodeCtrl'
      }
    }
  })

  .state('menu.nodeScan', {
    cache: false,
    url: '/nodescan',
    views: {
      'side-menu21': {
        templateUrl: 'templates/nodeScan.html'
      }
    }
  })

  .state('menu.gatewayScan', {
    cache: false,
    url: '/gatewayscan',
    views: {
      'side-menu21': {
        templateUrl: 'templates/gatewayScan.html'
      }
    }
  })

  .state('menu.registrationStatus', {
    url: '/adddevicesuccess',
    views: {
      'side-menu21': {
        templateUrl: 'templates/registrationStatus.html'
      }
    }
  })

  .state('menu.about', {
    url: '/about',
    views: {
      'side-menu21': {
        templateUrl: 'templates/about.html'
      }
    }
  })

  .state('menu.ssid', {
    url: '/ssid',
    views: {
      'side-menu21': {
        templateUrl: 'templates/ssid.html'
      }
    }
  })

$urlRouterProvider.otherwise('/home')

});
