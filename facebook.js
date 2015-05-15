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
		// Logged into your app and Facebook; Check permissions	
		if (response.status === 'connected') {				
			FB.api("/me/permissions",function (response) {
				var hasFriends = false
				var hasLocation = false
				var hasResponse = false
				if (response && !response.error) {
					hasResponse = true
					for(var i = 0; i < response.data.length; i++){
						if(response.data[i].permission === "user_location" && response.data[i].status === "granted")
							hasLocation = true
						if(response.data[i].permission === "user_friends" && response.data[i].status === "granted")
							hasFriends = true
						if(hasFriends && hasLocation)
							break
					}
				}
				// has all needed permissions
				if(hasFriends && hasLocation)
					WeMeet.initWho()
				// is logged in, but missing permissions
      			else if(hasResponse)
      			{      				
      				$("#facebook-login").removeAttr("disabled")
      				$("#facebook-login").text("Authorize WeMeet")		
      			}  	
      			// This shouldn't happen...
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