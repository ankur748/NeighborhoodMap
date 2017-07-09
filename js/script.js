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
            getZomatoEntitites(position,i);
        }

    });

}

//given geo-coordinates, we need to find the 3rd party Zomato entity id to get the appropriate data when requested
function getZomatoEntitites(position, i) {

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

        var marker  = markers[place];
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

    infoWindow.setContent('<div><b>' + marker.title + '</b></div><br><div id="zomato_info"><div id="rest-address"></div><br><div id="rating"><span><b>User Rating : </b></span></div><div id="cost"><span><b>Cost for 2 persons : </b></span></div><br><div><b><i>Powered by Zomato</i></b></div></div>');
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
            $('#rest-address').text(data.location.address);
            $('#rating span').append(data.user_rating.rating_text);
            $('#cost span').append('Rs.' + data.average_cost_for_two);
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

};

//event handling when user clicks a place to be searched
$('#searchlist').on('click','.list-group-item',function(e){

    var koContext = ko.contextFor(e.target);
    var clickedPlace = koContext.$data;

    google.maps.event.trigger(markers[clickedPlace],'click');

});

//event handling when user clicks the filter button, can be used for multiple places
$('#filter').click(function(e){

    var filteredPlaces = ko.contextFor(e.target).$data.filteredPlacesList();

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

//event handling when user presses enter in the search input box
$('#searchinput').keypress(function (e) {
    var key = e.which;

    if (key == 13) {
        $('#filter').click();
    }

});

ko.applyBindings(new viewModel());






