var userVisualInfo;
var otherVisualInfo;

//Modifies the headers so that they display the players names
function gP_displayUserNames(_user, _other) {
  $("#h_" + _user + "Player").text(userDetails.name);
  $("#h_" + _other + "Player").text(otherPlayer.name);
  if(_user == "reset" && _other == "reset") {
    $("#h_leftPlayer").text("Left");
    $("#h_rightPlayer").text("Right");
  }
}

//Updates the visible player data on the side colums
//_user: Either "left" or "right" to determine which side should display userDetails
//_other: Either "left" or "right" to determine which side should display otherPlayer
function gP_updateVisibleData(_user, _other) {
  //Update columns with userDetails
  $("#p_" + _user + "UserEmail").text("Email: " + userDetails.email);
  $("#p_" + _user + "UserWins").text("Wins: " + userDetails.wins);
  $("#p_" + _user + "UserTies").text("Ties: " + userDetails.ties);
  $("#p_" + _user + "UserLosses").text("Losses: " + userDetails.losses);

  //Update columns with otherPlayer
  $("#p_" + _other + "UserEmail").text("Email: " + otherPlayer.email);
  $("#p_" + _other + "UserWins").text("Wins: " + otherPlayer.wins);
  $("#p_" + _other + "UserTies").text("Ties: " + otherPlayer.ties);
  $("#p_" + _other + "UserLosses").text("Losses: " + otherPlayer.losses);
}

//Modifies what each grid looks like depending on the owner of the grid
function gP_displayGridChange(_gridId, _owner) {
  if (_owner == userDetails.uid) {
    gameGrid[_gridId].gridId.innerHTML = userVisualInfo.symbol;
    gameGrid[_gridId].gridId.style.backgroundColor = userVisualInfo.colour;
  } else if (_owner == otherPlayer.uid) {
    gameGrid[_gridId].gridId.innerHTML = otherVisualInfo.symbol
    gameGrid[_gridId].gridId.style.backgroundColor = otherVisualInfo.colour;
  }
}

//Prepares the grid for a new game by reseting the elements of the grid
function gP_resetGameGrid() {
  dM_writeRec(thisLobby, "gridState", [
    { owner: "none" },
    { owner: "none" },
    { owner: "none" },
    { owner: "none" },
    { owner: "none" },
    { owner: "none" },
    { owner: "none" },
    { owner: "none" },
    { owner: "none" }
  ]);
  for (i = 0; i < 9; i++) {
    gameGrid[i].gridId.innerHTML = "";
    gameGrid[i].state = "available";
    gameGrid[i].gridId.style.backgroundColor = "gray";

  }
}

function gP_displayWhoseTurn() {
  if (whoseTurn == userDetails.uid) {
    $("#h_whoseTurn").text("It is your turn!");
  } else if (whoseTurn == otherPlayer.uid) {
    $("#h_whoseTurn").text("It is the other players turn");
  }
}