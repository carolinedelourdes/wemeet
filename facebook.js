$(document).ready(function() {
  //$.ajaxSetup({ cache: true });
  $.getScript('//connect.facebook.net/en_UK/all.js', function(){
  	FB.init({
  		appId: '342664942589806',
  	});     
  	$('#loginbutton,#feedbutton').removeAttr('disabled');
  	FB.getLoginStatus(WeMeetFacebook.statusChangeCallback);
  })
/*
FB.login(function(response) {
  		if (!response.authResponse) {
  			$("#facebook-login").removeAttr("disabled")
  			$("#facebook-login").text("Connect to Facebook")
  		}
 });*/
});
var WeMeetFacebook = {
	statusChangeCallback: function(response){		
		if (response.status === 'connected') {
	      // Logged into your app and Facebook.
	      WeMeet.center("section#who",false)
	      WeMeet.fadeaway("section#introduction")
	      WeMeet.initFriendSelect()
	  } else if (response.status === 'not_authorized') {
	      // The person is logged into Facebook, but not your app.
	      $("#facebook-login").removeAttr("disabled")
	      $("#facebook-login").text("Connect to Facebook")
	  } else {
	      // The person is not logged into Facebook, so we're not sure if
	      // they are logged into this app or not.
	      $("#facebook-login").removeAttr("disabled")
	      $("#facebook-login").text("Login to Facebook")
	  }
	}
}