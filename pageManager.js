var counterWaitingHost = 0;

//Initializes the page elements
function pM_initialize() {
  pM_loginShow();
}

//Occurs many times per second
function pM_loop() {
  if (internalTime % 90 == 0) {
    counterWaitingHost++;
  }
  if (counterWaitingHost >= 4) {
    counterWaitingHost = 0;
  }
  $("#h_waitingForUser").text("Waiting for a user to join");
  for (i = 0; i < counterWaitingHost; i++) {
    $("#h_waitingForUser").append(".");
  }
}

function pM_registerShow() {
  //Display the register page
  $('#d_registerPage').show();
  //Hide the other elements
  $("#d_loginPage").hide();
  $("#d_ticTacToeGrid").hide();
  $("#d_findLobby").hide();
  $("#d_hostButton").hide();
}

//Run when the program wants the login page to be shown
function pM_loginShow() {
  //Display the login page
  $("#d_loginPage").show();
  //Hide the other elements
  $("#d_ticTacToeGrid").hide();
  $("#d_findLobby").hide();
  $("#d_hostButton").hide();
}

//Run when the program wants the tic tac toe grid to be shown
function pM_gridShow() {
  //Display the tic tac toe grid
  $("#d_ticTacToeGrid").show();
  //Display information to the users
  $(".userInfo").show();
  $("#h_whoseTurn").show();
  //Display disconnect button
  $("#b_disconnect").show();
  //Hide the other elements
  $("#d_loginPage").hide();
  $("#d_findLobby").hide();
  $("#d_hostButton").hide();
  $("#d_hostingLobby").hide();
}

//Run when the program wants the lobbies page to be shown
function pM_lobbiesShow() {
  //Initialize the finding game procedure
  fG_initialize();
  //Display the lobbies page and host button
  $("#d_findLobby").show();
  $("#d_hostButton").show();
  //Hide the other elements
  $("#d_ticTacToeGrid").hide();
  $("#d_loginPage").hide();
  $("#d_registerPage").hide();
  $("#b_disconnect").hide();
  $(".userInfo").hide();
  $("#h_whoseTurn").hide();
  $("#b_gameStart").hide();
  //Reset the displayed names
  gP_displayUserNames("reset", "reset");
}

function pM_hostingShow() {
  //Display the hosting a lobby page
  $("#d_hostingLobby").show();
  //Hide element
  $("#d_findLobby").hide();
}

function pM_userInfoUpdate() {
  //Check if the uid of the host is the same as our own uid
  if (gameHostUID == userDetails.uid) {
    //Display own user info on left side and other players info on right side
    gP_updateVisibleData("left", "right");
    gP_displayUserNames("left", "right");
  } else {
    //Display own user info on right side and other players info on left side
    gP_updateVisibleData("right", "left");
    gP_displayUserNames("right", "left");
  }
}

function pM_displayStartBtn(_text) {
  $("#b_gameStart").show();
  $("#b_gameStart").text(_text);
}

function pM_pressedStart() {
  $("#b_gameStart").hide();
  dM_writeRec(thisLobby, "ready", true);
}