var neighborhood_city = 'Ludhiana';
var neighborhood_places = ["Aman Chicken", "Indian Summer", "Rutba", "Barbeque Nation", "Bistro 226", "Rishi Dhaba", "Friend Dhaba", "Stardrunks", "Under Dogs", "Yellow Chilli"];

var map;
var markers = {};
var zomato_key_mapping = {};
var info_window;

var zomato_key = "427d11dab5abc0e5b2ce4b8882bff226";
var zomato_entities = {};

function initMap() {

    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({'address': neighborhood_city}, function(results, status) {

        if (status === google.maps.GeocoderStatus.OK) {

            var center = results[0].geometry.location;
            map = new google.maps.Map(document.getElementById('map'), {
                center: center,
                zoom: 13
            });

            for (var i = 0; i < neighborhood_places.length; i++) {

                var address = neighborhood_places[i] + ' ' + neighborhood_city;
                creatMarker(geocoder,address,i);
            }

        } else {
            alert("Some error occured. Please recheck your configuration and reload again");
        }
    })

}

function getZomatoEntitites(position, i) {

    var zomato_url = "https://developers.zomato.com/api/v2.1/search"

    zomato_url += "?" +$.param({
        lat: position.lat(),
        lon: position.lng()
    });

    $.ajax({
        url: zomato_url,
        headers: {  Accept : "text/plain; charset=utf-8",
                    "Content-Type": "text/plain; charset=utf-8",
                    "X-Zomato-API-Key": zomato_key },
        success: function(data) {
            zomato_key_mapping[neighborhood_places[i]] = data.restaurants[0].restaurant.id;
        }
    })
}

function creatMarker(geocoder,address, i) {

    geocoder.geocode({'address': address}, function(results, status) {

        if (status === google.maps.GeocoderStatus.OK) {

            var position = results[0].geometry.location;

            var marker = new google.maps.Marker({
                position : position,
                title : neighborhood_places[i],
                animation: google.maps.Animation.DROP,
                id: i,
                map: map,
                icon: make_marker("blue")
            });

            marker.addListener('click', function(){
                reset_markers();
                this.setIcon(make_marker("red"));
                this.setAnimation(google.maps.Animation.BOUNCE);
                populate_info_window(this);
            });

            markers[neighborhood_places[i]] = marker;
            getZomatoEntitites(position,i);
        }

    });

}

function make_marker(color) {
    var icon = {
        url: "http://maps.google.com/mapfiles/ms/icons/"+ color + "-dot.png",
        size: new google.maps.Size(30, 30),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(30, 30)
    }
    return icon;
}

function reset_markers() {

    for (var place in markers) {

        var marker  = markers[place];
        marker.setAnimation(null);
        marker.setIcon(make_marker("blue"));
    }

}

function populate_info_window(marker) {

    if(!info_window) {
        info_window = new google.maps.InfoWindow();
    }

    if(info_window.marker == marker) {
        return;
    }

    info_window.setContent('<div>' + marker.title + '</div><br><div id="zomato_info"><img id="thumb_image" src=""><br><br><div id="rating"><span>User Rating: </span></div><div id="cost"><span>Cost for two: </span></div><br><div><b><i>Powered by Zomato</i></b></div></div>');
    info_window.marker = marker;

    info_window.addListener('closeclick', function() {
        info_window.marker = null;
    });

    var zomato_url = "https://developers.zomato.com/api/v2.1/restaurant"

    zomato_url += "?" +$.param({
        res_id: zomato_key_mapping[marker.title]
    });

    $.ajax({
        url: zomato_url,
        headers: {  Accept : "text/plain; charset=utf-8",
                    "Content-Type": "text/plain; charset=utf-8",
                    "X-Zomato-API-Key": zomato_key },
        success: function(data) {
            debugger;
            $('#rating span').append(data.user_rating.aggregate_rating + '/5');
            $('#cost span').append('Rs. ' + data.average_cost_for_two);
            $('#thumb_image').attr('src', data.thumb);
        }
    })

    info_window.open(map, marker);

}

var view_model = function() {

    var self = this;

    self.searched_place = ko.observable("");
    self.places_list = ko.observableArray([]);

    neighborhood_places.forEach(function(place){
        self.places_list.push(place);
    });

    self.filtered_places_list = ko.computed(function() {

        var searched_place = self.searched_place().toLowerCase();

        if(!searched_place) {
            return self.places_list();
        } else {
            return ko.utils.arrayFilter(self.places_list(), function (place) {
                return place.toLowerCase().indexOf(searched_place) !== -1;
            });
        }

    });

};

$('#filter').click(function(e){

    var filtered_places = ko.contextFor(e.target).$data.filtered_places_list();

    for (var place in markers) {

        var marker  = markers[place];
        var index   = $.inArray(place, filtered_places);

        if(index != -1) {
            marker.setMap(map);
        } else {
            marker.setMap(null);
        }
    }
});

ko.applyBindings(new view_model());






