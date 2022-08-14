//18042jw@hvhs.school.nz || Jac Warr 2022
//2-Player Tic Tac Toe game

var internalTime = 0;

function setup() {
  createCanvas(0, 0);
  dM_initialize();
  dM_login(userDetails);
  pM_initialize();
  tTT_initialize();
}

function draw() {
  internalTime++;
  pM_loop();
}

function nothing() {
  //does nothing, acts as a placeholder
}