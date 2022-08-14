var gameGrid = [];
var activePlayer;
var inGame = false;
var whoseTurn;
var userIsHost = false;
var whoAmI = "";
var readyForRestart = false;
var databaseGrid = [
  { owner: "none" },
  { owner: "none" },
  { owner: "none" },
  { owner: "none" },
  { owner: "none" },
  { owner: "none" },
  { owner: "none" },
  { owner: "none" },
  { owner: "none" }
];
var gameOver = true;
var connectionState = true;

function tTT_initialize() {
  // Initializes the state of the game grid
  for (i = 0; i < 9; i++) {
    //Define the game grid array with objects
    gameGrid[i] = {
      state: "locked",
      owner: "none",
      //Define the element as a part of the grid object
      gridId: document.getElementById("b_ticTacToeGrid" + i)
    };
  }
}

// tTT_gameBegin()
// Causes the game grids to reset to allow a game to begin
function tTT_gameBegin() {
  if (gameOver == true) {
    console.log("tTT_gameBegin()");
    console.log('%c *********************************************** ', 'background: #000000; color: #000000');
    if (userIsHost == true) {
      dM_listenToDB(thisLobby, "connected/other", connectionState, playerDisconnected);
    } else if (userIsHost == false) {
      dM_listenToDB(thisLobby, "connected/host", connectionState, playerDisconnected);
    }
    function playerDisconnected(_state) {
      console.log("playerDisconnected()");
      console.log(_state);
      if (_state == false) {
        tTT_disconnect();
      }
    }
    $("#b_gameStart").hide();
    tTT_unlockAll();
    gameOver = false;
    dM_listenToDB(thisLobby, "gridState", databaseGrid, tTT_updateGridState, "grid");
    if (gameHostUID == userDetails.uid) {
      //user hosted a waiting lobby
      userIsHost = true;
      whoAmI = "host";
      whoseTurn = random([userDetails.uid, otherPlayer.uid]);
      dM_writeRec(thisLobby, "whoseTurn", whoseTurn);

      userVisualInfo = {
        symbol: "X",
        colour: "#ffc163"
      };
      otherVisualInfo = {
        symbol: "O",
        colour: "#c375ff"
      };
    } else {
      //user connected to a waiting lobby
      userIsHost = false;
      whoAmI = "other";

      userVisualInfo = {
        symbol: "O",
        colour: "#c375ff"
      };
      otherVisualInfo = {
        symbol: "X",
        colour: "#ffc163"
      };
    }
    gP_resetGameGrid();
    gP_displayUserNames();
    dM_writeRec(DETAILS, userDetails.uid, userDetails);
    tTT_confirmWhoseTurn();
    dM_readRecListen(thisLobby, "gameState", databaseGrid, "gridState");
    console.log("tTT_gameBegin: game ready");
  }
}

// tTT_updateGridState
// Ensures the visual elements of the game grid are updated properly
function tTT_updateGridState(_data) {
  if (_data != null) {
    console.log(_data);
    for (i = 0; i < 9; i++) {
      gameGrid[i].owner = _data[i].owner;
      gP_displayGridChange(i, gameGrid[i].owner);
    }
    if (gameOver == false) {
      //Check if a player has won
      console.log("check for win: update grid state");
      tTT_checkForWin();
    }
  }
}

// tTT_endTurn()
// Signals that a players turn has ended and allows the next player to have their turn
function tTT_endTurn() {
  tTT_lockAll();
  dM_writeRec(thisLobby, "whoseTurn", otherPlayer.uid);
}

function tTT_confirmWhoseTurn() {
  dM_listenToDB(thisLobby, "whoseTurn", whoseTurn, setTurn);
  function setTurn(_dBTurn) {
    whoseTurn = _dBTurn;
    gP_displayWhoseTurn();
    console.log(_dBTurn);
    if (_dBTurn == userDetails.uid) {
      //it is this users turn
      for (i = 0; i < 9; i++) {
        if (gameGrid[i].owner == "none") {
          gameGrid[i].state = "available";
        }
      }
    } else if (_dBTurn == otherPlayer.uid) {
      //it is the other players turn
      tTT_lockAll();
    }
  }
}

// tTT_gridClicked(_gridNumber)
// Signals that the Tic Tac Toe grid determined by "_gridNumber" has been clicked and changes that grids state and owner to fit the event
function tTT_gridClicked(_gridNumber) {
  // Checks if the grid that was clicked is a valid move 
  if (gameGrid[_gridNumber].state == "available") {
    // 
    gameGrid[_gridNumber].state = "taken";
    gameGrid[_gridNumber].owner = whoseTurn;
    gameLobby.gridState[_gridNumber].owner = userDetails.uid;
    dM_writeRec(thisLobby, "gridState/" + _gridNumber, gameLobby.gridState[_gridNumber]);

    // Changes the grid backgroundColor element of the style.css based on the current players colour and also places the correct symbol inside the grid based on the user
    gP_displayGridChange(_gridNumber, whoseTurn);

    // Calls a function to signal the end of the players turn
    tTT_endTurn();

    console.log("tTT_gridClicked: grid " + _gridNumber + " was clicked by player " + gameGrid[_gridNumber].owner);
    if (gameOver == false) {
      // Checks if someone has won
      console.log("check for win: grid clicked");
      tTT_checkForWin();
    }
  }
}

//Lock every grid
function tTT_lockAll() {
  for (i = 0; i < 9; i++) {
    gameGrid[i].state = "locked";
  }
}

//Unlock every grid
function tTT_unlockAll() {
  for (i = 0; i < 9; i++) {
    gameGrid[i].state = "available";
  }
}

//Check if the grid includes a winning move
function tTT_checkForWin() {
  //Checks if the owner of three grids in a line are the same
  if (gameGrid[0].owner == gameGrid[1].owner
    && gameGrid[0].owner == gameGrid[2].owner) {
    tTT_announceWin(gameGrid[0].owner);
  } else if (gameGrid[3].owner == gameGrid[4].owner
    && gameGrid[3].owner == gameGrid[5].owner) {
    tTT_announceWin(gameGrid[3].owner);
  } else if (gameGrid[6].owner == gameGrid[7].owner
    && gameGrid[6].owner == gameGrid[8].owner) {
    tTT_announceWin(gameGrid[6].owner);
  } else if (gameGrid[0].owner == gameGrid[3].owner
    && gameGrid[0].owner == gameGrid[6].owner) {
    tTT_announceWin(gameGrid[0].owner);
  } else if (gameGrid[1].owner == gameGrid[4].owner
    && gameGrid[1].owner == gameGrid[7].owner) {
    tTT_announceWin(gameGrid[1].owner);
  } else if (gameGrid[2].owner == gameGrid[5].owner
    && gameGrid[2].owner == gameGrid[8].owner) {
    tTT_announceWin(gameGrid[2].owner);
  } else if (gameGrid[4].owner == gameGrid[0].owner
    && gameGrid[4].owner == gameGrid[8].owner) {
    tTT_announceWin(gameGrid[4].owner);
  } else if (gameGrid[4].owner == gameGrid[2].owner
    && gameGrid[4].owner == gameGrid[6].owner) {
    tTT_announceWin(gameGrid[4].owner);
  } else if (gameGrid[0].owner != "none" && gameGrid[1].owner != "none" && gameGrid[2].owner != "none" && gameGrid[3].owner != "none" && gameGrid[4].owner != "none" && gameGrid[5].owner != "none" && gameGrid[6].owner != "none" && gameGrid[7].owner != "none" && gameGrid[8].owner != "none") {
    //Checks if all the grids are owned, but no user has won and if true, it will announce a draw
    tTT_announceDraw();
  } else {
    console.log("tTT_checkForWin(): no win condition detected");
  }
}

function tTT_announceWin(_tTTWinner) {
  //checks if a player was the winner
  if (_tTTWinner != "none") {
    if (_tTTWinner == userDetails.uid) {
      //Update the database with the users data
      userDetails.wins++;
      basicDetails.wins++;
      dM_writeRec(DETAILS, userDetails.uid, userDetails);
      if (whoAmI == 'host') {
        dM_writeRec(thisLobby, "hostData", basicDetails);
      } else if (whoAmI == 'other') {
        dM_writeRec(thisLobby, "otherData", basicDetails);
      }
      //Disable the ability to click on the grid once the game is over
      tTT_lockAll();

    } else if (_tTTWinner == otherPlayer.uid) {
      //Update the database with the users data
      userDetails.losses++;
      basicDetails.losses++;
      dM_writeRec(DETAILS, userDetails.uid, userDetails);
      if (whoAmI == 'host') {
        dM_writeRec(thisLobby, "hostData", basicDetails);
      } else if (whoAmI == 'other') {
        dM_writeRec(thisLobby, "otherData", basicDetails);
      }
    }
    dM_writeRec(thisLobby, "ready", false);
    tTT_gameOverListens();

    console.log("tTT_announceWin: player " + _tTTWinner + " has won");
  }
}

function tTT_announceDraw() {
  //Update the database with the users data
  userDetails.ties++;
  basicDetails.ties++;
  dM_writeRec(DETAILS, userDetails.uid, userDetails);
  if (whoAmI == 'host') {
    dM_writeRec(thisLobby, "hostData", basicDetails);
  } else if (whoAmI == 'other') {
    dM_writeRec(thisLobby, "otherData", basicDetails);
  }
  dM_writeRec(thisLobby, "ready", false);
  tTT_gameOverListens();

  console.log("tTT_announceDraw: the game resulted in a draw.");
}

function tTT_gameOverListens() {
  firebase.database().ref(thisLobby + "/gridState").off();
  firebase.database().ref(thisLobby + "/whoseTurn").off();
  //listen for restart game
  dM_listenToDB(thisLobby, "ready", readyForRestart, resetGame);
  pM_displayStartBtn("Play Again?");
  gameOver = true;
  function resetGame(_data) {
    console.log(_data);
    if (_data == true) {
      console.log("reset game");
      tTT_gameBegin();
      dM_writeRec(thisLobby, "ready", false);
    }
  }
}

function tTT_disconnect() {
  console.log("disconnecting from game");
  if(userIsHost == true) {
    dM_writeRec(thisLobby, "connected/host", false);
    firebase.database().ref(thisLobby + "/connected/host").onDisconnect().cancel();
    firebase.database().ref(thisLobby + "/connected/other").off();
  }else if (userIsHost == false) {
    dM_writeRec(thisLobby, "connected/other", false);
    firebase.database().ref(thisLobby + "/connected/other").onDisconnect().cancel();
    firebase.database().ref(thisLobby + "/connected/host").off();
  }
  pM_lobbiesShow();
  
}