//to be configured to your data
var NEIGHBORHOOD_CITY = 'Ludhiana'; //set to the city where your restaurants are based out of
var NEIGHBORHOOD_PLACES = [ "Aman Chicken",
                            "Indian Summer",
                            "Rutba",
                            "Barbeque Nation",
                            "Bistro 226",
                            "Rishi Dhaba",
                            "Friend Dhaba",
                            "Stardrunks",
                            "Under Dogs",
                            "Moti Mahal"]; //restaurant names to be shown on map
var ZOMATO_KEY = "427d11dab5abc0e5b2ce4b8882bff226"; //3rd party API - to be configured to your API key

//model used for application
var map;
var markers = {};
var zomatoKeyMapping = {};
var infoWindow;

//intial callback after google map is initilised to center it to neighborhood city
function initMap() {

    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({'address': NEIGHBORHOOD_CITY}, function(results, status) {

        if (status === google.maps.GeocoderStatus.OK) {

            var center = results[0].geometry.location;
            map = new google.maps.Map(document.getElementById('map'), {
                center: center,
                zoom: 13
            });

            for (var i = 0; i < NEIGHBORHOOD_PLACES.length; i++) {

                var address = NEIGHBORHOOD_PLACES[i] + ' ' + NEIGHBORHOOD_CITY;
                creatMarker(geocoder,address,i);
            }

        } else {
            alert("Unable to load Google Maps");
        }
    });

}

function loadMapError() {
    alert("Unable to use Google Maps API. Please check your configuration");
}

//google geocoding service called to get geo-coordinates of given address, then create associate marker and its events
function creatMarker(geocoder,address, i) {

    geocoder.geocode({'address': address}, function(results, status) {

        if (status === google.maps.GeocoderStatus.OK) {

            var position = results[0].geometry.location;

            var marker = new google.maps.Marker({
                position : position,
                title : NEIGHBORHOOD_PLACES[i],
                animation: google.maps.Animation.DROP,
                id: i,
                map: map,
                icon: makeMarker("blue")
            });

            marker.addListener('click', function(){
                resetMarkers();
                this.setIcon(makeMarker("red"));
                this.setAnimation(google.maps.Animation.BOUNCE);
                populateInfoWindow(this);
            });

            markers[NEIGHBORHOOD_PLACES[i]] = marker;
            getZomatoEntitites(address,position,i);
        } else {
            alert("Unable to locate " + address);
        }

    });

}

//given geo-coordinates, we need to find the 3rd party Zomato entity id to get the appropriate data when requested
function getZomatoEntitites(address, position, i) {

    var zomatoURL = "https://developers.zomato.com/api/v2.1/search";

    zomatoURL += "?" +$.param({
        lat: position.lat(),
        lon: position.lng()
    });

    $.ajax({
        url: zomatoURL,
        headers: {  Accept : "text/plain; charset=utf-8",
                    "Content-Type": "text/plain; charset=utf-8",
                    "X-Zomato-API-Key": ZOMATO_KEY },
        success: function(data) {
            zomatoKeyMapping[NEIGHBORHOOD_PLACES[i]] = data.restaurants[0].restaurant.id;
        },
        error: function() {
            alert("Unable to fetch data from Zomato for " + address);
        }
    });
}

//used to control the incon of the marker
function makeMarker(color) {
    var icon = {
        url: "http://maps.google.com/mapfiles/ms/icons/"+ color + "-dot.png",
        size: new google.maps.Size(30, 30),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(30, 30)
    };
    return icon;
}

//to reset all the markers to default state
function resetMarkers() {

    for (var place in markers) {

        var marker = markers[place];
        marker.setAnimation(null);
        marker.setIcon(makeMarker("blue"));
    }

}

//called on click of marker to show info window pop up with data from 3rd party API i.e Zomato
function populateInfoWindow(marker) {

    if(!infoWindow) {
        infoWindow = new google.maps.InfoWindow();
    }

    if(infoWindow.marker == marker) {
        return;
    }

    infoWindow.marker = marker;

    infoWindow.addListener('closeclick', function() {
        infoWindow.marker = null;
    });

    var zomatoURL = "https://developers.zomato.com/api/v2.1/restaurant";

    zomatoURL += "?" +$.param({
        res_id: zomatoKeyMapping[marker.title]
    });

    $.ajax({
        url: zomatoURL,
        headers: {  Accept : "text/plain; charset=utf-8",
                    "Content-Type": "text/plain; charset=utf-8",
                    "X-Zomato-API-Key": ZOMATO_KEY },
        success: function(data) {
            infoWindow.setContent('<div><b>' + marker.title + '</b></div><br>' +
                                  '<div>' +
                                      '<div>'+ data.location.address + '</div><br>' +
                                      '<div><span><b>User Rating : ' + data.user_rating.rating_text + '</b></span></div>' +
                                      '<div><span><b>Cost for 2 persons : Rs.' + data.average_cost_for_two +'</b></span></div><br>' +
                                      '<div><b><i>Powered by Zomato</i></b></div>' +
                                  '</div>');
        },
        error: function() {
            infoWindow.setContent("Unable to load data for " + marker.title + ". Please check your configuration/internet connection")
        }
    });

    map.panTo(new google.maps.LatLng(marker.position.lat(), marker.position.lng()));

    infoWindow.open(map, marker);

}

//knock out view model to do live search based on text input in search box
var viewModel = function() {

    var self = this;

    self.searchedPlace = ko.observable("");
    self.placesList = ko.observableArray([]);

    NEIGHBORHOOD_PLACES.forEach(function(place){
        self.placesList.push(place);
    });

    self.filteredPlacesList = ko.computed(function() {

        var searchedPlace = self.searchedPlace().toLowerCase();

        if(!searchedPlace) {
            return self.placesList();
        } else {
            return ko.utils.arrayFilter(self.placesList(), function (place) {
                return place.toLowerCase().indexOf(searchedPlace) !== -1;
            });
        }

    });

    self.locationClicked = function(location) {
        google.maps.event.trigger(markers[location],'click');
    };

    self.searchedPlace.subscribe(function() {

        var filteredPlaces = self.filteredPlacesList();

        for (var place in markers) {

            var marker  = markers[place];
            var index   = $.inArray(place, filteredPlaces);

            if(index != -1) {
                marker.setMap(map);
            } else {
                marker.setMap(null);
            }
        }

    });

};

ko.applyBindings(new viewModel());






