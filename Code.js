const universalTimeZone = "UTC";
const dateFormat = "yyyy/MM/dd";
const currentDay = Utilities.formatDate(new Date(), universalTimeZone, dateFormat);
const currentYear = currentDay.substring(0,4);


class FileList{
  
  constructor(){
    this.list = [];
  }
    
  addToArray(file){
    this.list.push(file);
  }
}

function RunOvOFolderSequence(){
  let ovofileList = RetrieveSheetsFromFolder(ovoFolderId);
  ovofileList.list.forEach(file => ShareEachApplicable(file));
}

function RetrieveSheetsFromFolder(folderId){
  let ovoFolder = DriveApp.getFolderById(folderId);
  let ovoFiles = ovoFolder.getFiles();
  let fileList = new FileList();  
  
  while(ovoFiles.hasNext()){
    let ovoFile = ovoFiles.next();
    let ovoFileName = ovoFile.getName();
    let ovoFileYear = ovoFileName.substring(0,4);
    if(ovoFileYear === currentYear){
      fileList.addToArray(ovoFile);
    }    
  }
  return fileList;
}

function ShareEachApplicable(file){
  let fileId = file.getId();
  let activeSheet = SpreadsheetApp.openById(fileId);
  SpreadsheetApp.setActiveSpreadsheet(activeSheet);
  timedShare();
}

function timedShare() {  
  let activeSheet = SpreadsheetApp.getActiveSheet();
  let ovoRepSheet = SpreadsheetApp.openById(ovoContactListSheetId);
  let sheetID = SpreadsheetApp.getActiveSpreadsheet().getId();
  let range = activeSheet.getRange('B1:B5');
  let status = range.getCell(4,1);
  let requestType = range.getCell(5,1).getValue();
  let targetMessage = determineAccountsType(requestType);
  if (status.isBlank()){
    let emails =  range.getCell(1,1);
    let requestDate = range.getCell(2,1);
    let requestTime = range.getCell(3,1);
    if(!requestDate.isBlank() && !requestTime.isBlank() && !emails.isBlank()){    
      if(checkToRelease(requestDate,requestTime)){        
        let sheetFile = DriveApp.getFileById(sheetID);
        let emailsList = emails.getValue();
        let emailArray = emailsList.split(";");
        let discordUserList = [];
        emailArray.forEach(
          email => {
            let trimmed = email.trim();
            sheetFile.addEditor(trimmed);
            let result = findDiscordUserByEmail(ovoRepSheet, trimmed);
            discordUserList.push(result);
          }
        )
        status.setValue(sharedMesssage);
        sharedMessenger(activeSheet.getParent().getName(), sheetID, targetMessage, discordUserList);
      }
    } else if (emails.isBlank()){     
      let emailMessage = getEmailErrorMessage(activeSheet.getParent().getName());
      discordMessenger(emailMessage);
      status.setValue(errorMissingEmail);
    } else if (requestDate.isBlank() || requestTime.isBlank()){    
      let timeMessage =  getTimeErrorMessage(activeSheet.getParent().getName());
      discordMessenger(timeMessage);
      status.setValue(errorDateTime);
    }   
  } 
}

function findDiscordUserByEmail(ovosheet, email){
  let outfits = ovosheet.getSheetByName(repOutfitTabName);
  let obsContacts = ovosheet.getSheetByName(repObsContactTabName);
  let repResult = fetchDiscordIdFromSheet(outfits, email);
  if (repResult === 'None_Found'){
    let obsResult = fetchDiscordIdFromSheet(obsContacts, email);
    return obsResult;
  } else{
    return repResult;
  }
}

function fetchDiscordIdFromSheet(contacts, email){  
  let maxEntries = contacts.getMaxRows() - 1;
  let emailEntries = contacts.getRange(2, 3, maxEntries).getValues();
  for(var i = 0; i<emailEntries.length;i++){
    if(emailEntries[i] == email){ 
      let correctCell = i+2;
      return contacts.getRange(`E${correctCell}`).getValue();
    }
  }
  return 'None_Found';
}

function determineAccountsType(requestType){
  if (requestType === observerAccountsType){
    return obsMessage;
  } else if (requestType === normalAccountsType) {
    return accountMessage;
  }
}
  
function getEmailErrorMessage(docName){
  let contents = `Oh no, I cannot find any emails to send accounts for ${docName}, <@&${ovoStaffDiscordGroupID}> Help!`; 
  return contents;
}

function getTimeErrorMessage(docName){
  let contents = `Oh no, someone bring a timemachine as I don't understand ${docName}, <@&${ovoStaffDiscordGroupID}> Help!`; 
  return contents;
}





