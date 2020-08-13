// Checks set time vs 4 hours before event.
function checkToRelease(requestDateString, requestTimeString){
  let formattedDateString = Utilities.formatDate(requestDateString.getValue(), universalTimeZone, dateFormat);
  let eventDate = new Date(formattedDateString+ " " + universalTimeZone);
  let hours = requestTimeString.getValue().substring(0,2);
  let minutes = requestTimeString.getValue().substring(3,5);
  
  eventDate.setUTCHours(hours, minutes);

  let checkedDate = new Date();
  checkedDate.setUTCHours(checkedDate.getUTCHours() + 4);
  if (checkedDate >= eventDate){
    return true;
  }else{
    return false;
  }  
}
