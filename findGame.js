/*

show the available games
  games need to list the username of the host and time it was opened
  

click on a waiting lobby
  is the lobby still waiting
    no?: the game became active or was closed -> send user back to the searching for game page and display an error message
    yes?: set the game to active -> join user into the lobby
  
*/

var hostedGame = {};
var gameHostUID = "";
var waitingGamesObj = {};

//Initializes the find game page by getting the waiting games list from the database
function fG_initialize() {
  dM_readAllRec(WAITING, fG_makeTable);
}


function fG_makeTable(_result, _data) {
  if (_result == "OK") {
    waitingGamesObj = _data.val();
    //iterate through the object once for each key
    _data.forEach(function(childSnapshot) {
      if (childSnapshot.key != userDetails.uid) {
        //set database data as simple to manage variables
        var key = childSnapshot.key;
        var childData = childSnapshot.val();
        if (childData.waiting == true) {
          //ensure document is loaded
          $(document).ready(function() {
            //set the table to its default appearance
            $('#t_waitingLobbyList').html("<tr><th>Join</th><th>Host's Name</th><th>Available Since</th></tr>");
            //grab table element and add a row with an id that matches the game key
            $("#t_waitingLobbyList").append("<tr id='t_" + key + "'></tr>");
            //grab the row id and add a joining button
            $("#t_" + key).append("<button class='w3-button' id='b_" + key + "'>Play!</button>");
            $("#b_" + key).click(function() {
              //join a game with the key
              fG_checkLobbyStatus(key);
              gameHostUID = key;
            });
            //grab the row id and add informational text
            $("#t_" + key).append("<td>" + childData.name + "</td>");
            //convert openedAt to a readable time value
            var readableTime = new Date(Number(childData.openedAt));
            readableTime[Symbol.toPrimitive]('string');
            $("#t_" + key).append("<td>" + readableTime + "</td>");
          });
        }
      }
    });
  }
}

//When the user is the host of a new game, this function will run and write to the database with their new game
function fG_hostGame() {
  pM_hostingShow();
  //create game variable
  var hostedGame = {
    waiting: true,
    openedAt: 0,
    name: "",
    joiner: ""
  };
  //personalize game variable
  hostedGame.name = userDetails.name;
  hostedGame.openedAt = Date.now();
  //remove past lobby records from the same user
  firebase.database().ref(ACTIVE + "/" + userDetails.uid).remove();
  firebase.database().ref(WAITING + "/" + userDetails.uid).remove();
  //write game to the database and attach a listener to the lobby
  dM_writeRec(WAITING, userDetails.uid, hostedGame, userDetails.uid);
}

//called to check if a waiting lobby is still available to join
function fG_checkLobbyStatus(_hostUID) {
  //Check if game is still available
  let lobbyIsWaiting;
  dM_readRec(WAITING, _hostUID, lobbyIsWaiting, "isGameWaiting");
}

//called when the lobbies host hears a player join their 
function fG_hostHeardJoiner(_path, _key, _data) {
  console.log(_data.joiner);
  if (_data.joiner != "") {
    if (inGame == false) {
      firebase.database().ref(_path + "/" + _key).off("value");
      inGame = true;
      console.log(_data);
      //update gameHostUID and gameLobby variables
      gameHostUID = userDetails.uid;
      gameLobby.timeStarted = Date.now();
      gameLobby.otherData.uid = _data.joiner;
      gameLobby.hostData = basicDetails;
      for (i = 0; i < 9; i++) {
        gameLobby.gridState[i].owner = "none";
      }
      //write a new active lobby
      dM_writeRec(ACTIVE, userDetails.uid, gameLobby);
      //save lobby key for ease of use later
      thisLobby = ACTIVE + "/" + userDetails.uid;
      //display the game grid
      pM_gridShow();
      //update visible user info
      pM_userInfoUpdate();
      //set up a check for if the user is still in the game
      dM_writeRec(ACTIVE, userDetails.uid + "/connected/host", true);
      firebase.database().ref(ACTIVE + "/" + userDetails.uid + "/connected/host").onDisconnect().set(false);
      //set up a listener to callback when the other user writes their data to the game lobby
      dM_listenToDB(ACTIVE, userDetails.uid + "/otherData", otherPlayer, update);
      function update(_info) {
        //update otherPlayer variable
        otherPlayer = _info;
        console.log(_info);
        //update visible user info
        pM_userInfoUpdate();
        gP_displayUserNames();
        //begin the game
        tTT_gameBegin();
        tTT_confirmWhoseTurn();
        if (_info.name != '') {
          firebase.database().ref(ACTIVE + "/" + userDetails.uid + "/otherData").off();
        }
      }
    } else {
      //User is already in a game
      console.log("callback(): inGame == true");
      firebase.database().ref(_path + "/" + _key).off("value");
    }
  }
}

//called to attempt to join a users waiting game lobby
function fG_joinGame(_result, _data, _key) {
  console.log("fG_joinGame(" + _result + ", " + _data + ", " + _key + ")");
  if (_result == true) {
    console.log("joining: " + _key);
    dM_writeRec(WAITING, _key + "/joiner", userDetails.uid);
    dM_writeRec(WAITING, _key + "/waiting", false);
    dM_listenToDB(ACTIVE, _key + "/otherData/uid", _data, writeBasic);
    function writeBasic(_data) {
      console.log("writeBasic()");
      console.log(_data);
      if (_data == userDetails.uid) {
        //write basic user info
        dM_writeRec(ACTIVE, _key + "/otherData", basicDetails);
        //save the lobby key to a variable
        thisLobby = ACTIVE + "/" + _key;
        //set up a check for if the user is still in the game
        dM_writeRec(ACTIVE, _key + "/connected/other", true);
        firebase.database().ref(ACTIVE + "/" + _key + "/connected/other").onDisconnect().set(false);
        pM_gridShow();
        pM_userInfoUpdate();
        //begin the game
        tTT_gameBegin();
        tTT_confirmWhoseTurn()
        //inform database that the user is ready
        dM_writeRec(thisLobby, "ready", true);
      }
    }
    dM_listenToDB(ACTIVE, _key + "/hostData", otherPlayer, saveOther);
    function saveOther(_data) {
      console.log("saveOther()");
      otherPlayer = _data;
      console.log(otherPlayer);
    }
  } else {
    console.log("lobby unavailable");
  }
}