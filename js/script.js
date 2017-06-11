var neighborhood_city = 'Ludhiana, India'; //used to initialise map
var neighborhood_places = ["Verka Milk Plant", "MBD Mall", "Orient Cinemas", "Kipps Market", "Aarti Cinemas"];

function initMap() {

    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({'address': neighborhood_city}, function(results, status) {

        if (status === google.maps.GeocoderStatus.OK) {

            var center = results[0].geometry.location;
            map = new google.maps.Map(document.getElementById('map'), {
                center: center,
                zoom: 13
            });

        } else {
            alert("Please select a valid neighborhood city in script.js");
        }
    })

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

ko.applyBindings(new view_model());