var config = {
    apiKey: "AIzaSyB5MMjOONicpJ_LkLkZWSsijlj14aA6nXY",
    authDomain: "traintime-1b3ae.firebaseapp.com",
    databaseURL: "https://traintime-1b3ae.firebaseio.com",
    projectId: "traintime-1b3ae",
    storageBucket: "traintime-1b3ae.appspot.com",
    messagingSenderId: "149448881468"
  };
  firebase.initializeApp(config);
var database = firebase.database();

var data;

  




database.ref().on("value", function(snapshot) {
  data = snapshot.val();
  refreshTable();

});





$("#addTrainButton").on('click', function(){

  // Collect values from the HTML Form
  var trainName = $("#nameInput").val().trim();
  var trainDestination = $("#destinationInput").val().trim();
  var trainFirstArrivalTime = $("#firstArrivalInput").val().trim();
  var trainFreq = $("#frequencyInput").val().trim();

  // Collect the date upon user click
  var today = new Date();
  var thisMonth = today.getMonth() + 1;
  var thisDate = today.getDate();
  var thisYear = today.getFullYear();

    // Create a String from the Date 
  var dateString = "";
  var dateString = dateString.concat(thisMonth, "/", thisDate, "/", thisYear);

    // Create a Date and Time String for Storage
  var trainFirstArrival = dateString.concat(" ", trainFirstArrivalTime);


  // Push New Data to FireBase
  database.ref().push({
    name: trainName,
    destination: trainDestination,
    firstArrival: trainFirstArrival,
    frequency: trainFreq
  });


  // Clear Input Fields After successful submission
  $("#nameInput").val("");
  $("#destinationInput").val("");
  $("#firstArrivalInput").val("");
  $("#frequencyInput").val("");


  // Prevent Default of Submit Button
  return false;
});






function refreshTable(){


  $('.table-body-row').empty();


  var arrayOfObjects = [];


  var arrayOfTimes = [];


  
  $.each(data, function(key, value){

    var trainName = value.name;
    var trainDestination = value.destination;
    var trainFreq = value.frequency;

    var trainFirstArrivalTime = value.firstArrival;
    

    var trainNextDeparture;
    var trainMinutesAway;


    // ----------------------- Calculate values using Moment.js -----------------------
    var convertedDate = moment(new Date(trainFirstArrivalTime));
    
       // First Train Departed
    var minuteDiffFirstArrivalToNow = moment(convertedDate).diff( moment(), "minutes")*(-1);

      if(minuteDiffFirstArrivalToNow <= 0){

        // Train Departure = Current Time - First Arrival Time
        trainMinutesAway = moment(convertedDate).diff( moment(), "minutes");

        // Next Depature Time = First Departure Time
        trainNextDepartureDate = convertedDate;

      }
      else{

        // Next Train Departure 
        trainMinutesAway = trainFreq - (minuteDiffFirstArrivalToNow % trainFreq);

         // Current Time + Minutes Away
        var trainNextDepartureDate = moment().add(trainMinutesAway, 'minutes');
      }
   

  
    trainNextDeparture = trainNextDepartureDate.format("hh:mm A");



    
    var newObject = {
      name: trainName,
      destination: trainDestination,
      freq: trainFreq,
      nextDeparture: trainNextDeparture,
      minAway: trainMinutesAway
    };

    
    arrayOfObjects.push(newObject);

  
    arrayOfTimes.push(trainMinutesAway);

  });



  // Sort the array of Time from smallest to largest
  arrayOfTimes.sort(function(a, b){return a-b});
  $.unique(arrayOfTimes)
    
  for(var i = 0; i < arrayOfTimes.length; i++){
    for(var j = 0; j < arrayOfObjects.length; j++){
      if(arrayOfObjects[j].minAway == arrayOfTimes[i]){

        var newRow = $('<tr>').addClass("table-body-row");

        var trainNameTd = $('<td>');
        var destinationTd = $('<td>');
        var frequencyTd = $('<td>');
        var nextDepartureTd = $('<td>');
        var minutesAwayTd = $('<td>');

        trainNameTd.text(arrayOfObjects[j].name);
        destinationTd.text(arrayOfObjects[j].destination);
        frequencyTd.text(arrayOfObjects[j].freq);
        nextDepartureTd.text(arrayOfObjects[j].nextDeparture);
        minutesAwayTd.text(arrayOfObjects[j].minAway);

  
        newRow.append(trainNameTd);
        newRow.append(destinationTd);
        newRow.append(frequencyTd);
        newRow.append(nextDepartureTd);
        newRow.append(minutesAwayTd);

        $('.table').append(newRow);

      }
    }
  }
}

// Materialize code 
$('.timepicker').pickatime({
    default: 'now', // Set default time: 'now', '1:30AM', '16:30'
    fromnow: 0,       // set default time to * milliseconds from now (using with default = 'now')
    twelvehour: false, // Use AM/PM or 24-hour format
    donetext: 'OK', // text for done-button
    cleartext: 'Clear', // text for clear-button
    canceltext: 'Cancel', // Text for cancel-button
    autoclose: false, // automatic close timepicker
    ampmclickable: true, // make AM PM clickable
    aftershow: function(){} //Function for after opening timepicker
  });

// ================================================================================


// Update the Current Time every second
var timeStep = setInterval(currentTime, 1000);

function currentTime(){
  var timeNow = moment().format("hh:mm:ss A");
  $("#current-time").text(timeNow);

  // Refresh the table every minute
  var secondsNow = moment().format("ss");

  if(secondsNow == "00"){
    refreshTable();
  }

}