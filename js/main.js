"use strict";

// Local storage variables
let lastLat;
let lastLng;

// Earthquake class
class Earthquake {
  constructor(mag, place, position, url, date) {
    this.mag = mag;
    this.place = place;
    this.position = position;
    this.url = url;
    this.date = new Date(date).toString();
  }
}

// Vue initilization
var app = new Vue({
  el: "#app",
  data: {
    URL:
    "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventtype=earthquake",
    currentLat: 43.083848,
    currentLng: -77.6799,
    limit: 10,
    earthquakes: [],
    markers: [],
    circles: [],
    radius: 250,
    year: 2019,
    ref: null,
    ip: null,
    magnitude: 1.0,
    searchMarker: null
  },
  methods: {
    // Initilizing Firebase
    initFirebase() {
      var config = {
        apiKey: "AIzaSyCclwHiZUCm9IhXiPE8VzweeM5NRubgspc",
        authDomain: "project2-1f1b6.firebaseapp.com",
        databaseURL: "https://project2-1f1b6.firebaseio.com",
        projectId: "project2-1f1b6",
        storageBucket: "project2-1f1b6.appspot.com",
        messagingSenderId: "418974804103",
        appId: "1:418974804103:web:39479a4a73216262"
      }

      firebase.initializeApp(config);
      let database = firebase.database();
      this.ref = database.ref("searches/");
    },

    // Initilizing Google Map
    initMap() {
      this.currentLat = parseFloat(localStorage.getItem("lastLat"));
      this.currentLng = parseFloat(localStorage.getItem("lastLng"));

      if (this.currentLat == null || this.currentLng == null || this.currentLat == undefined || this.currentLng == undefined || isNaN(this.currentLat) || isNaN(this.currentLng)) {
        this.currentLat = 43.083848;
        this.currentLng = -77.6799;
      }

      const mapOptions = {
        center: { lat: this.currentLat, lng: this.currentLng },
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(
        document.getElementById("map"),
        mapOptions
      );

      // Create search marker
      this.searchMarker = new google.maps.Marker({
        position: { lat: this.currentLat, lng: this.currentLng },
        draggable: true,
        map: this.map,
        icon: "img/searchIcon.png"
      });

      google.maps.event.addListener(this.searchMarker, 'mouseup', function (event) {
        this.currentLat = event.latLng.lat();
        this.currentLng = event.latLng.lng();

        localStorage.setItem("lastLat", this.currentLat);
        localStorage.setItem("lastLng", this.currentLng);

        app.search();
      });

      // Create search maker radius circle
      this.searchCircle = new google.maps.Circle({
        strokeColor: '#FFFFFF',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#CCCCCC',
        fillOpacity: 0.35,
        map: this.map,
        center: { lat: this.currentLat, lng: this.currentLng },
        radius: this.radius * 1000
      });

      this.initFirebase();

      this.search();
    },

    // Gets Ip address of client for firebase data purposes
    getIP(json) {
      this.ip = json.ip;
    },

    // Adds markers for earthquakes
    addMarker(quake) {
      let marker = new google.maps.Marker({
        position: quake.position,
        map: this.map,
        icon: "img/earthquakeIcon.png"
      });

      // Adds marker to array so able to clear them later
      this.markers.push(marker);

      // Add a listener for the click event
      google.maps.event.addListener(marker, 'mouseover', function (e) {
        app.makeInfoWindow(this.position,
          "<h6><a href='" + quake.url + "' target='_blank'>" + quake.place + "</a></h6>" +
          "<p><b>Date: </b> " + quake.date + "</p>" +
          "<p><b> Magnitude: </b>" + quake.mag + "</p>"
        );
      });

      // Draws quake radius circles
      let quakeCircle = new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: this.map,
        center: quake.position,
        radius: quake.mag * quake.mag * 10000
      });

      // Remove info window when mouse moves out of the quake's radius
      google.maps.event.addListener(quakeCircle, 'mouseout', function (e) {
        if (app.infoWindow) { app.infoWindow.close(); }
      });

      this.circles.push(quakeCircle);
    },

    // Creates info window for quakes
    makeInfoWindow(position, msg) {
      //Close old InfoWindow if it exists
      if (app.infoWindow) app.infoWindow.close();

      //Make a new InfoWindow
      app.infoWindow = new google.maps.InfoWindow({
        map: this.map,
        position: position,
        content: msg
      });
    },

    // Sets the zoom of the map
    setZoom(zoomLevel) {
      this.map.setZoom(zoomLevel);
    },

    // Searches for quakes with given params
    search() {
      if (app.infoWindow) {
        app.infoWindow.close();
      }

      let lat = parseFloat(localStorage.getItem("lastLat"));
      let lng = parseFloat(localStorage.getItem("lastLng"));

      this.deleteMarkers();

      this.drawSearchMarker(lat, lng);

      // End date
      let endDate = new Date(this.year, 11, 31);
      let endYear = endDate.getFullYear();
      let endMonth = endDate.getMonth();
      let endDay = endDate.getDate();

      // Start date
      let startDate = new Date(this.year, 1, 1);
      let startYear = startDate.getFullYear();
      let startMonth = startDate.getMonth();
      let startDay = startDate.getDate();

      // Builds the url
      let url = this.URL;

      url += "&minmagnitude=" + this.magnitude;
      url += "&latitude=" + lat;
      url += "&longitude=" + lng;
      url += "&maxradiuskm=" + this.radius;
      url += "&starttime=" + startYear + "-" + startMonth + "-" + startDay;
      url += "&endtime=" + endYear + "-" + endMonth + "-" + endDay;
      url += "&limit=" + this.limit;

      let xhr = new XMLHttpRequest();
      xhr.onload = this.jsonLoaded;

      xhr.onprogress = e => {
        let xhr = e.target;

        if (!xhr.loggedHeaders) {
          xhr.loggedHeaders = true; // only log the headers once
        }
      };

      xhr.onerror = e => console.log(`ERROR: ${e}`);
      xhr.open("GET", url, true);
      xhr.send();
    },

    // Loads in quakes in json form and parses the information
    jsonLoaded(e) {
      let xhr = e.target;

      if (xhr.readyState != xhr.DONE) return;

      let responseText = xhr.responseText;

      let obj = JSON.parse(responseText);
      let count = obj.metadata.count;

      // Bails out if there are no results
      if (!count) {
        // Displays error message when no search results found
        this.$refs.searchError.style.margin = "-4%";
        this.$refs.searchError.style.transform = "scale(1)";
        this.$refs.searchError.style.opacity = 1;
        return;
      }

      // Hides error message
      this.$refs.searchError.style.margin = "-15%";
      this.$refs.searchError.style.transform = "scale(0)";
      this.$refs.searchError.style.opacity = 0;

      // Builds list of the results
      let earthquakes = obj.features;

      // Count for loop below
      let i = 0;

      for (let quake of earthquakes) {
        let properties = quake.properties;
        let title = properties.title;
        let url = properties.url;
        let longitude = quake.geometry.coordinates[0];
        let latitude = quake.geometry.coordinates[1];
        let position = { lat: latitude, lng: longitude };

        this.earthquakes[i] = new Earthquake(earthquakes[i].properties.mag, earthquakes[i].properties.place, position, earthquakes[i].properties.url, earthquakes[i].properties.time, earthquakes[i].id);
        this.addMarker(this.earthquakes[i]);
        this.ref.push("searches/").set({ earthquake: this.earthquakes[i], date: new Date().toUTCString(), ip: this.ip });

        i++;
      }
    },

    // Calears and draws the radius circle for the search marker
    drawSearchMarker(latitude, longitude) {
      this.searchCircle.setMap(null);
      this.searchCircle = null;

      this.searchCircle = new google.maps.Circle({
        strokeColor: '#FFFFFF',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#CCCCCC',
        fillOpacity: 0.35,
        map: this.map,
        center: { lat: latitude, lng: longitude },
        radius: this.radius * 1000
      });
    },

    // Clears all the quake markers and radius circles
    deleteMarkers() {
      for (let i = 0; i < this.markers.length; i++) {
        this.markers[i].setMap(null);
      }
      this.markers = [];

      for (let i = 0; i < this.circles.length; i++) {
        this.circles[i].setMap(null);
      }
      this.circles = [];
    }

  }
});
