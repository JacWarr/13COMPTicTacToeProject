const DETAILS = "userDetails";
const WAITING = "waitingGames";
const ACTIVE = "activeGames";
var thisLobby = "";

//used to debug database functions
var loginStatus = '';
var readStatus = '';
var writeStatus = '';

var userDetails = {
  uid: '',
  email: '',
  name: '',
  photoURL: '',
  wins: 0,
  ties: 0,
  losses: 0,
  age: 0,
  country: ''
};
var basicDetails = {
  uid: '',
  email: '',
  name: '',
  wins: 0,
  ties: 0,
  losses: 0
};

var otherPlayer = {
  uid: '',
  email: '',
  name: '',
  photoURL: '',
  wins: '',
  ties: '',
  losses: ''
};

var gameLobby = {
  ready: false,
  whoseTurn: "",
  timeStarted: 0,
  gridState: [
    { owner: "none" },
    { owner: "none" },
    { owner: "none" },
    { owner: "none" },
    { owner: "none" },
    { owner: "none" },
    { owner: "none" },
    { owner: "none" },
    { owner: "none" }
  ],
  hostData: {
    uid: "",
    email: "",
    name: "",
    wins: 0,
    ties: 0,
    losses: 0
  },
  otherData: {
    uid: "",
    email: "",
    name: "",
    wins: 0,
    ties: 0,
    losses: 0
  }
}

//Initialize the firebase app
function dM_initialize() {
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyCcVfzj5fCf2-SiHwhOeomQvrov4AZx_zM",
    authDomain: "comp-2022-jac-warr.firebaseapp.com",
    projectId: "comp-2022-jac-warr",
    storageBucket: "comp-2022-jac-warr.appspot.com",
    messagingSenderId: "336095133886",
    appId: "1:336095133886:web:e791009cd51b0f28979eef",
    measurementId: "G-G29B2QHQ1G"
  };
  // initialization of the firebase app
  firebase.initializeApp(firebaseConfig);
  var database = firebase.database();
}

//Login the user
function dM_login(_data) {
  //console.log("dM_login(" + _data + ")");
  firebase.auth().onAuthStateChanged(dM_newUser);

  function dM_newUser(user) {
    if (user) {
      //user is signed in
      _data.uid = user.uid;
      _data.email = user.email;
      _data.name = user.displayName;
      _data.photoURL = user.photoURL;
      loginStatus = 'logged in';
      //display the registration page
      pM_registerShow();
      //process userdetails
      dM_readRec(DETAILS, userDetails.uid, _data, "userDetailsProc");
      //console.log("dM_newUser(" + user + "): user is signed in");
    } else {
      //user isn't logged in, send user to Google login
      _data = {};
      loginStatus = 'logged out';
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider);
      //console.log("dM_newUser(" + user + "): user isn't signed in");
    }
  }
}

//Write a record to the database
function dM_writeRec(_path, _key, _data, _listenKey) {
  firebase.database().ref(_path + '/' + _key).set(_data,
    function(error) {
      if (error) {
        console.log("dM_writeRec: " + error);
      } else {
        console.log("dM_writeRec: no error");
        if (_data != null && _listenKey != null) {
          dM_readRecListen(_path, _listenKey, _data);
        }
      }
    });
}

//Read all the records from the database
function dM_readAllRec(_path, _func) {
  //console.log("dM_readAllRec(" + _path + ", " + _func + ")");
  firebase.database().ref(_path).once("value", gotData, readErr);

  //a callback function run when the read returns
  function gotData(_snapshot) {
    if (_snapshot.val() == null) {
      console.log("gotData(" + _snapshot.val() + ")");
    } else {
      _func("OK", _snapshot)
    }
  }

  //Log error if one is found
  function readErr(error) {
    console.log(error)
  }
}

//Read a record from the database
function dM_readRec(_path, _key, _data, _func) {
  firebase.database().ref(_path + '/' + _key).once("value", gotData, readErr);
  function gotData(snapshot) {
    if (snapshot.val() == null) {

    } else {
      if (_func == "userDetailsProc") {
        let user = snapshot.val();
        //process user details
        _data.uid = user.uid;
        _data.email = user.email;
        _data.name = user.name;
        _data.photoURL = user.photoURL;
        _data.wins = user.wins;
        _data.ties = user.ties;
        _data.losses = user.losses;
        //_data.myTurn = user.myTurn;
        _data.age = user.age;
        _data.country = user.country;
        //reload the autofill of the input boxes on register page
        rG_intialize();
        //process basic user details
        basicDetails.uid = user.uid;
        basicDetails.email = user.email;
        basicDetails.name = user.name;
        basicDetails.wins = user.wins;
        basicDetails.ties = user.ties;
        basicDetails.losses = user.losses;
      } else if (_func == "activeGamesProc") {
        let activeGames = snapshot.val();
        _data.active = activeGames.active;
        _data.otherPlayer = activeGames.otherPlayer;
        _data.whoseTurn = activeGames.whoseTurn;
      } else if (_func == "waitingGamesProc") {
        let waitingGames = snapshot.val();
        _data.openedAt = waitingGames.openedAt;
        _data.waiting = waitingGames.waiting;
        _data.name = waitingGames.name;
        _data.joiner = waitingGames.joiner;
      } else if (_func == "isGameWaiting") {
        if (snapshot.val().waiting == true) {
          _data = true;
        }
        console.log(snapshot.val());
        fG_joinGame(_data, snapshot.val(), _key)
      }
    }
  }
  function readErr(error) {
    console.log(error)
  }
}

//Read a record with a listener
function dM_readRecListen(_path, _key, _data, _callbackType) {
  console.log("dM_readRecListen(" + _path + "/" + _key + ")");
  dM_listenToDB(_path, _key, _data, callback, _callbackType);

  //
  function callback(_data, _callbackType) {
    console.log(_callbackType);
    if (_callbackType == "joiner") {
      //listener heard and returned with a joining users uid
      fG_hostHeardJoiner(_path, _key, _data);
    } else if (_callbackType == "gridState") {
      //
      console.log(_data);
    } else {
      console.log("invalid: _callbackType");
    }
  }
  console.log(_data);
}

async function dM_listenToDB(_path, _key, _data, _callback, _callbackType) {
  //Wait for database update
  await firebase.database().ref(_path + "/" + _key).on("value", (snapshot) => {
    //Update the data value to the updated database value
    _data = snapshot.val();

    //jank solution to error I encountered (function called without _callbackType param, but callback needs param)
    if (_path + "/" + _key == WAITING + "/" + userDetails.uid) {
      _callbackType = "joiner";
    }
    //Callback function run after database updates
    _callback(_data, _callbackType);
  });
}

//Button functions
function dM_buttonLogin() {
  //login the user
  dM_login(userDetails);
  //write the login data to the database
  dM_writeRec(DETAILS, userDetails.uid, userDetails);
}

