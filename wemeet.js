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
		}, {scope: 'user_location,user_friends,user_likes'});
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
				location: response.location.name,
				id: 0,
				selected: true
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
					location: response.data[i].location.name,
					id: i + 1,
					selected: false
				});	
			}
			// add empty element, so that the id corresponds to element position
			// (current user is 0)
			else
				WeMeet.friends.push( {
					name: response.data[i].name, // try to get name, this may be undefined
					id: i + 1,
					selected: false
				 } )
		}
		// update counter in case some friends were skipped due to missing information
		WeMeet.numFriends = WeMeet.friends.length
		WeMeet.addFriendsHTML()
		if(typeof WeMeet.me.location != "undefined")
		{
			WeMeet.numPeople = WeMeet.numFriends + 1
			WeMeet.numPeopleSelected = 1
			// add user to array
			WeMeet.friends.unshift(WeMeet.me)
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
		if(typeof friend.location != "undefined")
		{
			html += '<div data-id="'+friend.id+'" class="friend selectable unselected small-6 medium-4 large-3 columns" data-equalizer-watch>'
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
		}
		return html
	},
	// set up  appropriate action listeners - not to be called until after friends are drawn
	initFriendBehavior: function(){

		// update count to include only valid people
		WeMeet.numPeople = jQuery.grep(WeMeet.friends, function(friend) {
		  return (typeof friend.location != "undefined")
		}).length
		WeMeet.numFriends = WeMeet.numPeople
		if(WeMeet.me.location != "undefined")
			WeMeet.numFriends--

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
				// update array
				var id = parseInt($(this).data("id"))
				WeMeet.friends[id].selected = false
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
				// update array
				var id = parseInt($(this).data("id"))
				WeMeet.friends[id].selected = true
			}
		}); // friend.click()
	}, // initFriendBehavior()
	initWhat: function()
	{
		// remove event listener and selection styles
		$(".friend").removeClass("selectable").removeClass("selected").unbind()

		// remove unselected friends (original positions no longer needed)
		WeMeet.friends = jQuery.grep(WeMeet.friends, function(friend) {
		  return typeof friend.selected != "undefiend" && friend.selected === true
		});
		// update count
		WeMeet.numPeople = WeMeet.friends.length
		WeMeet.numFriends = WeMeet.numPeople
		if (typeof WeMeet.me.selected === "undefined" || WeMeet.me.selected === false)
			WeMeet.numFriends--

		WeMeetGoogle.onReady()
		// disable button, get coordinates for selected friends
		$("#done-selecting").attr("disabled",true).text("Getting Map Information")
		var callback = false // this indicates if the callback should be called (display map when all friend data is available)
		for(var i = 0; i < WeMeet.numPeople; i++)
		{
			console.log(i)
			console.log(WeMeet.friends[i])
			// the last friend
			if(i === (WeMeet.numPeople -1))
				callback = true	
			if(typeof WeMeet.friends[i].selected != "undefined" && WeMeet.friends[i].selected === true)
				WeMeetGoogle.getPeopleCoordinates(WeMeet.friends[i],callback,WeMeet.getCoordinatesCallBack)
			else if(callback)
				WeMeet.getCoordinatesCallBack()
		}		
		// display map section		
		$("#done-selecting").fadeOut()
		$("#who").slideUp("slow")
		$("#friends-selected").insertAfter("#who-is-heading")
		$("#what").fadeIn("slow")
		$(".google-attribution-holder").fadeIn("slow")
		// if screen size changes, re-center the map
		$(window).resize(function() {
	  		WeMeetGoogle.centerMap()
		});
		$("#search-stuff").submit(function(event) {			
			WeMeetGoogle.mapRequest($("#search-stuff").children("input").val(),WeMeet.mapSearchCallback)
			event.preventDefault()
			return false
		});
		// make sure search box is enabled
		$("#search-stuff input").prop("disabled",false)
		
		


	},
	makeNearbyHTML: function(response){
		console.log(response)
		console.log(response.length)
		console.log(response[0].name)
		var numPlaces = response.length
		var html = ""
		for(var i = 0; i < numPlaces; i++)
		{
			if(typeof response[i].name != "undefined")
				html += '<li class="small-6 columns" data-equalizer-watch><span class="selectable">' + response[i].name + '</span></li>'
		}	

		$("#like-list").append(html)

		// friend like submit
		$( "#like-list li" ).click(function() {
			$("body").animate({scrollTop:0}, '500', 'swing') 
  			WeMeetGoogle.mapRequest($(this).text(),WeMeet.mapSearchCallback)
		});
	},
	getCoordinatesCallBack: function(){
		// init map
		var mapCanvas = document.getElementById('map-canvas')
		WeMeetGoogle.initMap(mapCanvas,WeMeet.friends)
		WeMeetGoogle.getNearby(WeMeet.makeNearbyHTML)


	},
	// display search markers
	mapSearchCallback: function(statusGood) {
		if(statusGood)
			$("#no-results").fadeOut("fast")			
		else
			$("#no-results").fadeIn("slow")
		$("#search-stuff input").prop("disabled",false)
	}
}; // WeMeet