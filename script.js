/* application init */
$(document).ready(function(){
	/* center introduction on load or resize */
	var ActiveSectionId = "section#introduction"
	WeMeet.center(ActiveSectionId,false)
	$( window ).resize(function() {
	  WeMeet.center(ActiveSectionId,false)
	});
	$("#facebook-login").click(function(){
		$(this).attr("disabled", true)	
		FB.login(function(response) {
			WeMeetFacebook.statusChangeCallback(response)			
		}, {scope: 'user_location,user_friends'});
	})
});
/* library */
var WeMeet = {
	friends: [],
	numFriends: 0,
	/* center active section */
	center: function(ActiveSectionId,animate,reveal){
		var introMargins = ($(window).height() - $(ActiveSectionId).height()) / 2
		if(animate){
			$(ActiveSectionId).show("slow").animate({ 
			    'padding' : introMargins+"px 0px"
			}, "slow");
		}
		else{
			$(ActiveSectionId).removeAttr("hidden")
			$(ActiveSectionId).css("padding",introMargins+"px 0px")
		}
	},
	/* hide */
	fadeaway: function(InactiveSectionId){
		$(InactiveSectionId).slideUp("slow")
	},
	/* select friends*/
	initFriendSelect: function(){
			WeMeetFacebook.GetFriends()
			$(document).foundation({
  				equalizer : {
		    		equalize_on_stack: true
		  		}
			});
			$(".friend").click(function() {
				if($(this).hasClass("selected"))
				{
					$(this).removeClass("selected").addClass("unselected")
					$(this).appendTo("#friends-select")
					$(document).foundation('equalizer', 'reflow');
					numSelected--;
					if(numSelected <= 0)
					$("#friends-selected").hide()
				}
				else
				{
					$(this).removeClass("unselected").addClass("selected")
					$("#friends-selected").show()
					$(this).insertBefore("#friends-selected .go-holder")
					$(document).foundation('equalizer', 'reflow');
					numSelected++;
				}
			});
	},
	makeFriendsList: function (response){
		var friends = [];
		var numFriends = response.data.length
		// build friends list
		for(var i = 0; i < numFriends; i++)
		{
			this.friends.push({
				coordinates: new google.maps.LatLng(34.189764,-118.844758),
				title: response.data[i].name,
				photo: 'http://lorempixel.com/50/50/people?f=0'
			});
		}
		console.log(friends)
	}
};