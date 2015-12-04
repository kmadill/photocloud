var photocloud = angular.module('photocloud', ['ionic','ngCordova','firebase'])

var firebase = new Firebase('https://photocloudkm.firebaseio.com');

photocloud.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('login',{
      url: '/login',
      templateUrl:'templates/login.html',
      controller: 'AuthCtrl',
      cache: false
    })
    .state('photos',{
      url: '/photos',
      templateUrl:'templates/photos.html',
      controller:'PhotosCtrl'
    });
    $urlRouterProvider.otherwise('/login');
}])

.controller('AuthCtrl',['$scope', '$state','$firebaseAuth', function($scope, $state,$firebaseAuth){
  auth = $firebaseAuth(firebase);

  // Get Login Status
  firebase.onAuth(getStatusCallback);

  $scope.login = function(username, password){
    auth.$authWithPassword({
      email: username,
      password: password
    }).then(function(authData){
      console.log('You Are Logged In!');
      $state.go('photos');
    }).catch(function(error){
      console.log('Error: '+error);
    });
  }

  $scope.register = function(username, password){
    auth.$createUser({
      email: username,
      password: password
    }).then(function(authData){
      console.log('You Are Registered');
      $state.go('photos');
    }).catch(function(error){
      console.log('Error: '+error);
    });
  }

  $scope.logout = function(){
    console.log('Logging Out...');
    auth.$unauth();
    $state.go('login');
  }

  function getStatusCallback(authData){
    if(authData){
      console.log("User "+ authData.uid + " is logged in with "+authData.provider);
    } else {
      console.log("User is logged out");
    }
  }

}])

.controller('PhotosCtrl',['$scope', '$state','$ionicHistory','$cordovaCamera', '$firebaseArray', function($scope, $state, $ionicHistory, $cordovaCamera, $firebaseArray){
  $ionicHistory.clearHistory();

  $scope.images = [];

  var auth = firebase.getAuth();

  // Get Login Status
  firebase.onAuth(getStatusCallback);

  if(auth){
    var userReference = firebase.child("users/"+auth.uid);
    var syncArray = $firebaseArray(userReference.child("images"));
    $scope.images = syncArray;
  } else {
    $state.go('login');
  }

  $scope.upload = function(){
    var options = {
      quality: 75,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: Camera.PictureSourceType.CAMERA,
      allowEdit: true,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      targetWidth: 500,
      targetHeight: 500,
      saveToPhotoAlbum: false
    };

    $cordovaCamera.getPicture(options).then(function(data){
      syncArray.$add({image: data}).then(function(){
        alert('Image Uploaded!');
      });
    }, function(err){
      console.log('Error: '+err);
    });

  }

  function getStatusCallback(authData){
    if(authData){
      console.log("User "+ authData.uid + " is logged in with "+authData.provider);
    } else {
      console.log("User is logged out");
    }
  }
}])
