This project deals with showing places around a neighborhood in a Google Map.

We are taking a particular city and configuring restaurants in the city to show more information about them.

Features
- Showing all the restaurants configured in the backend for the city
- Filtering of restaurants by name using live search configured
- Get more information from 3rd Party API i.e Zomato to get more information about a particular restaurant like User Rating, Cost for Two people and associated restaurant image if any.

To get started, Issue the following command to clone the repository

git clone https://github.com/ankur748/NeighborhoodMap

Once you have the repository cloned to your local, we need two things to carry forward

Default API keys used are already configured. To configure them seperately for your project, Do the following steps

- visit https://developers.google.com/console
- Configure your google account to create a new project
- In APIs section, give access to all the respective google APIs which you need. For our case, it would be all APIs related to google maps and geocoding services.
- For 3rd Party API integration i.e Zomato for this project, visit https://developers.zomato.com/api
- Request for free API key of Zomato

These two API keys need to be configured in the respective location which are marked in the code
- For Google client key, it is to be configured in index.html map callback
- For Zomato client key, it is to be configured in js/script.js file

Next, we can configure the city and respective restaurants which we want to show for the city on the map with filtering option.

- The names are hardcoded in the js/script.js file and marked there for configuration. You can set the main city and the respective restaurants to be shown in the city for the map.

Run the project

- Just open the file index.html in browser of your choice and ensure you are connected to internet for smooth functioning of the application.

Backend Implementation

- We use Google Geocoding service to first center the map to the neighborhood city
- We then use geocoding service to get the geo-coordinates of the restaurants configured in the backend
- Based on geo-coordinates received in the previous step, we call 3rd Party Zomato API to get the entity_id for the given geo-coordinate. This step is needed because the actual information required to be gathered from API needs this entity_id to proceed
- We have configured the live search on the filter box using knockout framework and bindings.
- We use the computed observer to check the current data associated in the search box and then filtering on it
- Click events on filter and list items are configured to ensure that respective data on the map is filtered to that particular user action.
- We then associate click event on the marker to open a info window on the marker.
- In the info window content, we then call the Zomato API to fetch information about the restaurant like Cost for two people, User Rating and Associated Restaurant Image if any.
- We also use Google Animation and Custom Marker Icons for clicked and normal marker.
- Bootstrap and Jquery features are used for the view of the application and interaction with third party interfaces

References
- https://developers.zomato.com/documentation
- https://developers.google.com/maps/documentation/javascript/
- http://knockoutjs.com/documentation/introduction.html
- http://getbootstrap.com/getting-started/