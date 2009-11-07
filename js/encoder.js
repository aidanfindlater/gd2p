// Error messages from http://www.geocodezip.com/example_geo2.asp
var reasons = [];
reasons[G_GEO_SUCCESS]            = "Success";
reasons[G_GEO_MISSING_ADDRESS]    = "Missing Address: The address was either missing or had no value.";
reasons[G_GEO_UNKNOWN_ADDRESS]    = "Unknown Address:  No corresponding geographic location could be found for the specified address.";
reasons[G_GEO_UNAVAILABLE_ADDRESS]= "Unavailable Address:  The geocode for the given address cannot be returned due to legal or contractual reasons.";
reasons[G_GEO_BAD_KEY]            = "Bad Key: The API key is either invalid or does not match the domain for which it was given";
reasons[G_GEO_TOO_MANY_QUERIES]   = "Too Many Queries: The daily geocoding quota for this site has been exceeded.";
reasons[G_GEO_SERVER_ERROR]       = "Server error: The geocoding request could not be successfully processed.";
reasons[G_GEO_BAD_REQUEST]        = "A directions request could not be successfully parsed.";
reasons[G_GEO_MISSING_QUERY]      = "No query was specified in the input.";
reasons[G_GEO_UNKNOWN_DIRECTIONS] = "The GDirections object could not compute directions between the points.";


function parseWaypoints() {
  var waypoints = document.getElementById('waypointList').value.split('\n');
  return waypoints;
}

function encodeDirections(waypoints) {
  points = [];

  var directions = new GDirections();
  directions.loadFromWaypoints(waypoints, {'getPolyline':true});

  GEvent.addListener(directions, 'load', function() {
    var p = directions.getPolyline();
    console.log(p);
    // Introspects the polyline to get lat/lng and levels data
    var q = r = null;
    
    // Get the points first so that we can use its length to identify the levels array
    // We identify it by the 'x' and 'y' variables in its first element
    for (var it in p) {
        if (typeof p[it] == 'object' && p[it] != null
            && typeof p[it][0] != 'undefined' && p[it][0] != null
            && typeof p[it][0].x != 'undefined' && p[it][0].x != null)
                q = p[it];
    }

    // Now find the levels data
    // It should be an array of numbers of the same length as the points array with values between 0 and 3
    for (var it in p) {
        if (typeof p[it] == 'object' && p[it] != null
            && typeof p[it][0] == 'number' && p[it][0] != null
            && p[it][0] >= 0 && p[it][0] <= 3
            && p[it].length == q.length)
                r = p[it];
    }
    
    console.log(q.length);
    console.log(r.length);

    for (var i=0; i<q.length; i++) {
      points.push({
        Latitude: q[i].y,
        Longitude: q[i].x,
        Level: r[i]
      });
    }
    createEncodings(true);
  });

  GEvent.addListener(directions, 'error', function() {
    var stat = this.getStatus();
    document.getElementById('message').innerHTML = '<p><strong>Error ' + stat.code + ':</strong> ' + reasons[stat.code] + '</p>';
  });
}

function drawEncodedPoints() {
  if (document.overlay) {
    document.map.removeOverlay(document.overlay);
  }

  document.overlay = GPolyline.fromEncoded({
    color: '#0000FF',
    weight: 10,
    opacity: 0.5,
    points: document.getElementById('encodedPolyline').value,
    levels: document.getElementById('encodedLevels').value,
    zoomFactor: 32,
    numLevels: 4
  });  
  document.map.addOverlay(document.overlay);
}
