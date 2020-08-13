const universalTimeZone = "UTC";
const dateFormat = "yyyy/MM/dd";
const currentDay = Utilities.formatDate(new Date(), universalTimeZone, dateFormat);
const currentYear = currentDay.substring(0,4);
const standardDriveLink = "https://drive.google.com/drive/u/0/shared-with-me";


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
  ovofileList.list.forEach(file => ShareEachApplicable(file,accountMessage));  
  let obsfileList = RetrieveSheetsFromFolder(obsFolderId);
  obsfileList.list.forEach(file => ShareEachApplicable(file,obsMessage)); 
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

function ShareEachApplicable(file, targetMessage){
  let fileId = file.getId();
  let activeSheet = SpreadsheetApp.openById(fileId);
  SpreadsheetApp.setActiveSpreadsheet(activeSheet);
  timedShare(targetMessage);
}

function timedShare(targetMessage) {  
  let activeSheet = SpreadsheetApp.getActiveSheet();
  let ovoRepSheet = SpreadsheetApp.openById(ovoContactListSheetId);
  let sheetID = SpreadsheetApp.getActiveSpreadsheet().getId();
  let range = activeSheet.getRange('B1:B4');
  let status = range.getCell(4,1);
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
        sharedMessenger(activeSheet.getParent().getName(), targetMessage, discordUserList);
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
  // info of getrange: 2 = second row to avoid column name, 3 = email column
  let maxEntries = outfits.getMaxRows() - 1;
  let maxObsEntries = obsContacts.getMaxRows() - 1;
  let emailInstances = outfits.getRange(2, 3, maxEntries).getValues();
  let obsEmailInstances = obsContacts.getRange(2, 3, maxObsEntries).getValues();
  let totalEmails = emailInstances.concat(obsEmailInstances);
  for(var i = 0; i<totalEmails.length;i++){
    if(totalEmails[i] == email){ 
      let correctCell = i+2;
      return ovosheet.getRange(`E${correctCell}`).getValue();
    }
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





