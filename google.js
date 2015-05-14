var WeMeetGoogle = {
	service: null,
	map: null,
	bounds: null,
	centerPoint: null,
	centerMarker: null,
	people: [],
	numPeople: 0,
	peopleMarkers: [],
	searchMarkers: [],
	onReady: function()
	{
		WeMeetGoogle.service = new google.maps.places.PlacesService($('#google-attribution').get(0))
	},
	getPeopleCoordinates: function(currentPerson,isLastPerson,callback)
	{
		var city = currentPerson.location
		WeMeetGoogle.service.textSearch({query: city }, function(response){ 
		//if(typeof response[0] != "undefined" && response[0].geometry != "undefined" && response[0].geometry.location != "undefined")
		//	currentPerson.coordinates = new google.maps.LatLng(parseInt(response[0].geometry.location.k),parseInt(response[0].geometry.location.D))
		currentPerson.coordinates = new google.maps.LatLng(parseFloat(response[0].geometry.location.k),parseFloat(response[0].geometry.location.D))		
		if(isLastPerson){
			callback()
			console.log("last person")
		}
		});			
	},
	setCenterAndBounds: function(){
		 // draw the boundary box for all of the friends
		 WeMeetGoogle.bounds = new google.maps.LatLngBounds()
		 for (var i = 0; i < WeMeetGoogle.numPeople; i++) {
		 	WeMeetGoogle.bounds.extend(WeMeetGoogle.people[i].coordinates)
		 }
		 WeMeetGoogle.centerPoint = WeMeetGoogle.bounds.getCenter()
		},
		centerMap: function(){
		//  Fit these bounds to the map
		WeMeetGoogle.map.fitBounds(WeMeetGoogle.bounds)
	},
	initMap: function(mapCanvas,people)
	{
		console.log("init map")
		// set people and num people
		WeMeetGoogle.people = people
		WeMeetGoogle.numPeople = people.length
		// set bounds and center
		WeMeetGoogle.setCenterAndBounds()
		// setup map to center point
		var mapOptions = {
			center: WeMeetGoogle.centerPoint, 
			zoom: 12,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			scrollwheel: false,
			streetViewControl: false,
			mapTypeControl: false
		}
		// actually create & show the map
		WeMeetGoogle.map = new google.maps.Map(mapCanvas, mapOptions)	
		// for input search
		WeMeetGoogle.service = new google.maps.places.PlacesService(WeMeetGoogle.map)
		// fit map to bounds
		WeMeetGoogle.centerMap()
		// layer to allow for marker styling
		var overlay = new google.maps.OverlayView()	
		overlay.draw = function () {
			this.getPanes().markerLayer.id='markerLayer'
		};
		overlay.setMap(WeMeetGoogle.map)	
		// center marker	
		var centerIcon = new google.maps.MarkerImage('http://maps.google.com/mapfiles/ms/icons/flag.png', null, null, null, new google.maps.Size(32,32));
		WeMeetGoogle.centerMarker = new google.maps.Marker({
			position: WeMeetGoogle.centerPoint,
			map: WeMeetGoogle.map,
			title: 'Center Point',
			icon: centerIcon,
		});
		// people markers
		for(i = 0; i < WeMeetGoogle.numPeople; i++)
		{
			WeMeetGoogle.peopleMarkers[i] = new google.maps.Marker({
				position: WeMeetGoogle.people[i].coordinates,
				map: WeMeetGoogle.map,
				title: WeMeetGoogle.people[i].name,
				icon: WeMeetGoogle.people[i].photo,
        		optimized: false // to allow for styling in overlay div
        	});
		}
	},
	getNearby: function(callback)
	{
		var request = {
			location: WeMeetGoogle.centerPoint,
			radius: 10000,
			types: ['establishment']
		}
		console.log(request)
		WeMeetGoogle.service.nearbySearch(request, callback);
	},
	mapRequest: function(query,callback)
	{
		// remove previous search markers
		for (var i = 0, marker; marker = WeMeetGoogle.searchMarkers[i]; i++) {
			marker.setMap(null)
		}
		// search within 5 mile radius of center point, and draw markers for them
		var request = {
			keyword: query,
			location: WeMeetGoogle.centerPoint,
			radius: 10000,
			types: ['establishment']//,
			//rankBy: google.maps.places.RankBy.DISTANCE
		}
		WeMeetGoogle.service.nearbySearch(request, function(results, status){
			console.log(results)
			var returnStatus = false
			// add marker for earch search result and set flag
			if (status == google.maps.places.PlacesServiceStatus.OK)
			{
				returnStatus = true
				var numResults = results.length
				for (var i = 0; i < numResults; i++) {
					WeMeetGoogle.createMarker(results[i])
				}	
			}
			// make sure the center marker is always visible
			WeMeetGoogle.centerMarker.setZIndex(google.maps.Marker.MAX_ZINDEX + 1);
			// WeMeet callback
			callback(returnStatus)
		})
	},
	// draw new marker for search result
	createMarker: function(place) {
		var placeLoc = place.geometry.location
		var placeContent = WeMeetGoogle.makePlaceInfoHTML(place)
		var infowindow = new google.maps.InfoWindow({
		      content: placeContent
		  });
		var marker = new google.maps.Marker({
			title: place.name,
			map: WeMeetGoogle.map,
			position: place.geometry.location
		});
		google.maps.event.addListener(marker, 'click', function() {
		    infowindow.open(WeMeetGoogle.map,marker);
		});
		WeMeetGoogle.searchMarkers.push(marker)
	},
	makePlaceInfoHTML: function(place) {
		var html = ""
		html += '<article class="place">'
		html += '<div class="heading">'
		html += '<img class="icon" src="' + place.icon + '" />'
		html += '<h1>' + place.name + '</h1>'
		html += '</div>'
		html += '<div class="details">'
		html += '<address>' + place.vicinity + '</address>'
		html += '</div>'
		html += '</article>'
		return html
	}
}