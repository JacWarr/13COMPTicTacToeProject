/*rG_*/

function rG_intialize() {
  console.log(userDetails);
  $('#i_registerAge').val(userDetails.age);
  $('#i_registerCountry').val(userDetails.country);
}

function rG_resgisterPressed() {
  //age is validated in the html
  if (+$('#i_registerAge').val() >= 5 && +$('#i_registerAge').val() <= 100 && isNaN(parseFloat($('#i_registerCountry').val()))) {
    userDetails.age = $('#i_registerAge').val();
    dM_writeRec(DETAILS, userDetails.uid + "/age", userDetails.age);
    userDetails.country = $('#i_registerCountry').val();
    dM_writeRec(DETAILS, userDetails.uid + "/country", userDetails.country);
    pM_lobbiesShow();
  }
}