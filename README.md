# Earthquake Searcher


## Project Infomation
- **Platform:** Website

- **Team:** 1

- **Project Setting:** Educational

- **Link:** https://people.rit.edu/tec1850/330/330Project2/


## Documentation
The Google Maps Earthquake Searcher is a website that uses three different APIs to allow the user to search for Earthquakes using Google Maps as the interface. In addition, I used a Firebase Real-time Database to store user search data.

- Integrated three different APIs:
  - Google Maps - Map interface
  - Earthquake USGS - Earthquake database
  - IPify - Gets IP address of the user
- Coded website to locally store where the marker was placed last and location is saved between sessions.
- Set up a FireBase server that is used to track:
  - Earthquake Searches​
  - IP address of the searcher
  - Time of day search was requested
- Designed User interface for searching earthquakes to look as if it was a part of Google Maps.
- Followed conventional coding standards and used ES6, Vue, and Ajax.

## APIs Used
- **Google Maps:** https://developers.google.com/maps/documentation/javascript/tutorial
- **Earthquake USGS:** http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&callback=jsonLoaded
- **IPify:** https://www.ipify.org/
