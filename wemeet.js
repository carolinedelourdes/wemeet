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
	me: [],
	friends: [],
	numFriends: 0,
	numPeople: 0,
	numPeopleSelected: 0,
	/* center active section */
	center: function(ActiveSectionId,animate,reveal){
		var introMargins = ($(window).height() - $(ActiveSectionId).height()) / 2
		if(animate){
			$(ActiveSectionId).show("slow").animate({ 
			    'padding' : introMargins+"px 0px"
			}, "slow");
		}
		else {
			$(ActiveSectionId).removeAttr("hidden")
			$(ActiveSectionId).css("padding",introMargins+"px 0px")
		}
	}, // center
	/* select friends*/
	initWho: function(){
		$("#introduction").slideUp("slow")
		$("#who").fadeIn("slow")
		WeMeetFacebook.getMe()// calls makeMe
	}, // initWho()
	// CALLBACK put user into WeMeet friends variable
	makeMe: function (response){
		// add current user if all the required information is there
		if(typeof response.name != "undefined" && typeof response.picture != "undefined" && typeof response.location != "undefined")
		{
			WeMeet.me = {
				name: response.name + " (You)",
				photo: response.picture.data.url,
				location: response.location.name
			};
			var html = WeMeet.makeFriendHTML(WeMeet.me)
			$(html).insertBefore("#friends-selected #done-holder").removeClass("unselected").addClass("selected")
		}
		WeMeetFacebook.getFriends()// calls makeFriendsList
	},
	// CALLBACK put user friends into WeMeet friends variable
	makeFriendsList: function (response){
		WeMeet.numFriends = response.data.length
		for(var i = 0; i < WeMeet.numFriends; i++)
		{	
			// Add friend if all the required information is there.
			if(typeof response.data[i].name != "undefined" && typeof response.data[i].picture != "undefined" && typeof response.data[i].location != "undefined")
			{
				WeMeet.friends.push({
					name: response.data[i].name,
					photo: response.data[i].picture.data.url,
					location: response.data[i].location.name
				});
			}
		}
		// update counter in case some friends were skipped due to missing information
		WeMeet.numFriends = WeMeet.friends.length
		WeMeet.addFriendsHTML()
		if(typeof WeMeet.me.name != "undefined")
		{
			WeMeet.numPeople = WeMeet.numFriends + 1
			WeMeet.numPeopleSelected = 1
		}
		else
			WeMeet.numPeople = WeMeet.numFriends
		WeMeet.initFriendBehavior()
	}, // makeFriendsList()
	// add HTML for each friend onto the page
	addFriendsHTML: function(){
		var html = ""
		for(var i = 0; i < WeMeet.numFriends; i++)
		{
			html += WeMeet.makeFriendHTML(WeMeet.friends[i])
		}
		$("#friends-select").append(html)
	}, // drawFriends()
	makeFriendHTML: function(friend)
	{
		var html = ""
		html += '<div class="friend unselected small-6 medium-4 large-3 columns" data-equalizer-watch>'
		html += '<div class="friend-wrapper clearfix">'
		html += '<div class="profile-photo">'
		html += '<div class="photo-wrap"><img src="'+ friend.photo +'" alt="'+ friend.name +' Profile Photo"/></div>'
		html += '</div>' //.profile-photo
		html += '<div class="details">'
		html += '<div class="friend-name">'+ friend.name +'</div>'
		html += '<div class="friend-location">' + friend.location+'</div>'
		html += '</div>' //.details
		html += '</div>' //.friend-wrapper
		html += '</div>' //.friend
		return html
	},
	// set up  appropriate action listeners - not to be called until after friends are drawn
	initFriendBehavior: function(){
			$(document).foundation({
  				equalizer : {
		    		equalize_on_stack: true
		  		}
			});
			// event listener to go location search
			$("#done-selecting").click(function(){
				$(this).attr("disabled",true)
				WeMeet.initWhat()
			})
			// event listener to move or remove friend from selection area
			$(".friend").click(function() {
				if($(this).hasClass("selected"))
				{
					// going from all to less than all
					if(WeMeet.numPeopleSelected >= WeMeet.numPeople){
						$("#all-going").fadeOut()
					}
					// going from 2 to less than 2
					if(WeMeet.numPeopleSelected === 2){
						$("#no-friends").fadeIn()
						$("#done-selecting").fadeOut()
					}
					// remove 1 from current selection
					WeMeet.numPeopleSelected--;
					// update flag
					$(this).removeClass("selected").addClass("unselected")
					// move to selected
					$(this).appendTo("#friends-select")
					$(document).foundation('equalizer', 'reflow');
				}
				else
				{
					// going from 0 to 1 selections
					if(WeMeet.numPeopleSelected === 0)
					{
						$("#all-going").fadeOut()
					}
					// going from 1 to 2 selections
					else if (WeMeet.numPeopleSelected === 1){
						$("#no-friends").fadeOut()
						$("#done-selecting").fadeIn()
					}
					// add 1 to current selection
					WeMeet.numPeopleSelected++;
					// all available Facebook Friends have been selected (and there was at least one to pick)
					if(WeMeet.numPeopleSelected >= WeMeet.numPeople && WeMeet.numPeople > 0)
						$("#all-going").fadeIn()
					// update flag
					$(this).removeClass("unselected").addClass("selected")
					// move to unselected
					$(this).insertBefore("#friends-selected #done-holder")
					$(document).foundation('equalizer', 'reflow');
				}
			}); // friend.click()
	}, // initFriendBehavior()
	initWhat: function()
	{
		$("#done-selecting").fadeOut()
		$("#who").slideUp("slow")
		$("#friends-selected").insertAfter("#who-is-heading")
		$("#what").fadeIn("slow")
		$(".google-attribution-holder").fadeIn("slow")

		/*
		var mapCanvas = document.getElementById('map-canvas');
		var mapOptions = {
			center: new google.maps.LatLng(34.201167, -118.923688), // default to Camarillo, just because :)
			zoom: 12,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			scrollwheel: false,
			streetViewControl: false,
			mapTypeControl: false
		}
		WeMeetGoogleMap.initGoogleMap(mapCanvas,MapOptions)*/

	}

}; // WeMeet