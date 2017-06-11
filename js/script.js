var neighborhood_city = 'Ludhiana, India'; //used to initialise map
var neighborhood_places = ["Verka Milk Plant", "MBD Mall", "Orient Cinemas", "Kipps Market", "Aarti Cinemas"];

var map;
var markers = {};

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

function creatMarker(geocoder,address, i) {

    geocoder.geocode({'address': address}, function(results, status) {

        if (status === google.maps.GeocoderStatus.OK) {

            var position = results[0].geometry.location;

            var marker = new google.maps.Marker({
                position : position,
                title : neighborhood_places[i],
                animation: google.maps.Animation.DROP,
                id: i,
                map: map
            });

            markers[neighborhood_places[i]] = marker;
        }

    });

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






