function initMap() {
    //alert("Loaded");
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.7413549, lng: -73.9980244},
        zoom: 13
    });
}

var neighborhood_places = ["Verka Milk Plant", "MBD Mall", "Orient Cinemas", "Kipps Market", "Aarti Cinemas"];

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