var neighborhood_places = ["Verka Milk Plant", "MBD Mall", "Orient Cinemas", "Kipps Market", "Aarti Cinemas"];

var view_model = function() {

    var self = this;

    self.searched_place = ko.observable("");
    self.places_list = ko.observableArray([]);

    neighborhood_places.forEach(function(place){
        self.places_list.push(place);
    });

    // self.searchFilter = function(data,event) {

    //     debugger;
    //     var searched_place = data.searched_place();
    // };

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