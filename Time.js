// Checks set time vs 4 hours before event.
export function checkToRelease(requestDateString, requestTimeString){
  let eventDate = retrieveDateFromString(requestDateString)
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

// Checks if it has been more than 2 days since the event would have happened.
export function oldEnoughToClean(eventDate){
  let checkedDate = new Date();  
  eventDate.setUTCDate(eventDate.getUTCDate() + 2);
  if (checkedDate >= eventDate){
    return true;
  }else{
    return false;
  } 
}


export function retrieveDateFromString(requestDateString){
  let formattedDateString = Utilities.formatDate(requestDateString.getValue(), universalTimeZone, dateFormat);
  return new Date(formattedDateString+ " " + universalTimeZone);
}