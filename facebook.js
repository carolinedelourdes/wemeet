$(document).ready(function() {
	$.getScript('//connect.facebook.net/en_UK/all.js', function(){
		FB.init({
			appId: '342664942589806',
		});     
		$('#loginbutton,#feedbutton').removeAttr('disabled');
		FB.getLoginStatus(WeMeetFacebook.statusChangeCallback);
	})
});
var WeMeetFacebook = {
	statusChangeCallback: function(response){		
		if (response.status === 'connected') {				
			// Logged into your app and Facebook.
			// To do.. check for Friends AND Location Permission
			FB.api("/me/permissions/user_friends", function (response) {
				// response returned
				if (response && !response.error) {
	      			// has location permission
	      			if(response.data[0] && response.data[0].status === "granted")
	      			{
	      				WeMeet.initWho()
	      			}
	      			// does not have location permission
	      			else
	      			{      				
	      				$("#facebook-login").removeAttr("disabled")
	      				$("#facebook-login").text("Authorize WeMeet")		
	      			}  	
	      		}   
      			// display an error (this shouldn't happen...)
      			else
      			{
      				$("#facebook-login").text("Facebook Error")	
      			}      					
      		});		
		}
		// The person is logged into Facebook, but on the app
		else if (response.status === 'not_authorized') {
			$("#facebook-login").removeAttr("disabled")
			$("#facebook-login").text("Connect to Facebook")
		}
		// The person is not logged into Facebook
		else
		{
			$("#facebook-login").removeAttr("disabled")
			$("#facebook-login").text("Login to Facebook")
		}
	},
	getMe: function(){
		FB.api("/me?fields=name,location,picture", WeMeet.makeMe)
	},
	getFriends: function(){
		FB.api("/me/friends?fields=name,location,picture", WeMeet.makeFriendsList)
	}	
}