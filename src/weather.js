// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
  function(e) {
    console.log('AppMessage received!');
  }                     
);

var xhrRequest = function (url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
};

function sendWeather(url) {
  // Send request to OpenWeatherMap
  xhrRequest(url, 'GET', 
    function(responseText) {
      // responseText contains a JSON object with weather info
      var json = JSON.parse(responseText);

      // Temperature in Kelvin requires adjustment
      var temperature = Math.round(json.main.temp - 273.15);
      console.log('Temperature is ' + temperature);

      // Conditions
      var conditions = json.weather[0].main;      
      console.log('Conditions are ' + conditions);
      // Assemble dictionary using our keys

      var dictionary = {
        'KEY_TEMPERATURE': temperature,
        'KEY_CONDITIONS': conditions,
        0:temperature,
        1:conditions
      };

      // Send to Pebble
      Pebble.sendAppMessage(dictionary,
        function(e) {
          console.log('Weather info sent to Pebble successfully!');
        },
        function(e) {
          console.log('Error sending weather info to Pebble!');
        }
      );

    }      
  );
}

function sendSplunk(url) {
  // Send request to OpenWeatherMap
  xhrRequest(url, 'GET', 
    function(responseText) {
      //console.log('responseText=');
      //console.log(responseText);
      var count01 = (responseText.match(/prod01.*\n.*succes/g) || []).length;
      var count02 = (responseText.match(/prod02.*\n.*succes/g) || []).length;
      var count03 = (responseText.match(/prod03.*\n.*succes/g) || []).length;
      var count04 = (responseText.match(/prod04.*\n.*succes/g) || []).length;
      var count05 = (responseText.match(/prod05.*\n.*succes/g) || []).length;
      var count06 = (responseText.match(/prod06.*\n.*succes/g) || []).length;

      console.log('prod01 '+count01);      
      console.log('prod02 '+count02);      
      console.log('prod03 '+count03);      
      console.log('prod04 '+count04);      
      console.log('prod05 '+count05);      
      console.log('prod06 '+count06);      

      var dictionary = {
        1:count01,
        2:count02,
        3:count03,
        4:count04,
        5:count05,
        6:count06,
      };

      // Send to Pebble
      Pebble.sendAppMessage(dictionary,
        function(e) {
          console.log('IsAlive info sent to Pebble successfully!');
        },
        function(e) {
          console.log('Error sending IsAlive info to Pebble!');
        }
      );
    }      
  );
}

function locationSuccess(pos) {
  // Construct URL
  var url = 'http://api.openweathermap.org/data/2.5/weather?lat=' +
      pos.coords.latitude + '&lon=' + pos.coords.longitude;
  sendSplunk('http://isalive.fmk.netic.dk/fmk/prod.html');
}
  
function locationError(err) {
  console.log('Error requesting location!');
  // Construct URL
  var url = 'http://api.openweathermap.org/data/2.5/weather?lat=56&lon=10';
  sendSplunk('https://splunk.netic.dk/en-US/app/triforkfmk/pebble_wall');
}

function getWeather() {
  navigator.geolocation.getCurrentPosition(
    locationSuccess,
    locationError,
    {timeout: 15000, maximumAge: 60000}
  );
}

// Listen for when the watchface is opened
Pebble.addEventListener('ready', 
  function(e) {
    console.log('PebbleKit JS ready!');

    // Get the initial weather
    //getWeather();
    sendSplunk('http://isalive.fmk.netic.dk/fmk/prod.html');
  }
);

// Listen for when an AppMessage is received
Pebble.addEventListener('appmessage',
  function(e) {
    console.log('AppMessage received!');
    getWeather();
  }                     
);
