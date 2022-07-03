const universalTimeZone = "UTC";
const dateFormat = "yyyy/MM/dd";
const currentDay = Utilities.formatDate(new Date(), universalTimeZone, dateFormat);
const currentYear = currentDay.substring(0, 4);

class FileList {

  constructor() {
    this.list = [];
  }

  addToArray(file) {
    this.list.push(file);
  }
}

function RunOvOFolderSequence() {
  let ovofileList = RetrieveSheetsFromFolder(ovoFolderId);
  ovofileList.list.forEach(file => ShareEachApplicable(file));
}

function RetrieveSheetsFromFolder(folderId) {
  let ovoFolder = DriveApp.getFolderById(folderId);
  let ovoFiles = ovoFolder.getFiles();
  let fileList = new FileList();

  while (ovoFiles.hasNext()) {
    let ovoFile = ovoFiles.next();
    let ovoFileName = ovoFile.getName();
    let ovoFileYear = ovoFileName.substring(0, 4);
    if (ovoFileYear === currentYear) {
      fileList.addToArray(ovoFile);
    }
  }
  return fileList;
}

function ShareEachApplicable(file) {
  let fileId = file.getId();
  let activeSheet = SpreadsheetApp.openById(fileId);
  SpreadsheetApp.setActiveSpreadsheet(activeSheet);
  timedShare(file.getDateCreated());
}

function timedShare(fileCreationDate) {
  let activeSheet = SpreadsheetApp.getActiveSheet();
  let ovoRepSheet = SpreadsheetApp.openById(ovoContactListSheetId);
  let sheetID = SpreadsheetApp.getActiveSpreadsheet().getId();
  let range = activeSheet.getRange('B1:B5');
  let status = range.getCell(4, 1);
  let requestType = range.getCell(5, 1).getValue();
  let accountType = determineAccountsType(requestType);
  let requestDate = range.getCell(2, 1);
  if (status.isBlank()) {
    let emails = range.getCell(1, 1);
    let requestTime = range.getCell(3, 1);
    if (!requestDate.isBlank() && !requestTime.isBlank() && !emails.isBlank()) {
      if (checkToRelease(requestDate, requestTime)) {
        let success = false;
        let sheetFile = DriveApp.getFileById(sheetID);
        let emailsList = emails.getValue();
        let emailArray = emailsList.split(";");
        let discordUserList = [];
        emailArray.forEach(
          email => {
            let trimmed = email.trim();
            if (validateEmail(trimmed)) {
              sheetFile.addEditor(trimmed);
              let result = findDiscordUserByEmail(ovoRepSheet, trimmed, accountType);
              discordUserList.push(result);
              success = true;
            } else {
              let timeMessage = getNotEmailError(activeSheet.getParent().getName());
              discordMessenger(timeMessage);
            }
          }
        )
        if (success) {
          status.setValue(sharedMesssage);
          sharedMessenger(activeSheet.getParent().getName(), sheetID, accountType, discordUserList);
        } else {
          status.setValue("Error: Incorrect Email");
        }

      }
    } else if (emails.isBlank()) {
      // let sheetFile = DriveApp.getFileById(sheetID);
      // let sheetCreateDate = sheetFile.getDateCreated();
      // let sheetCreatedHour = sheetCreateDate.getUTCHours();
      // todo add check if it has been X minutes and then send an error message or something.

      let emailMessage = getEmailErrorMessage(activeSheet.getParent().getName());
      discordMessenger(emailMessage);
      status.setValue(errorMissingEmail);
    } else if (requestDate.isBlank() || requestTime.isBlank()) {
      let timeMessage = getTimeErrorMessage(activeSheet.getParent().getName());
      discordMessenger(timeMessage);
      status.setValue(errorDateTime);
    }
  } else {
    let eventDate = retrieveDateFromString(requestDate);
    if (oldEnoughToClean(eventDate)) {
      let monthName = eventDate.toLocaleString('default', { month: 'long' });
      let currentFolderYearResult = DriveApp.getFoldersByName(`${currentYear} Archive`);
      let yearFolder = currentFolderYearResult.next();
      let fetchParent = yearFolder.getParents().next();
      if (fetchParent.getId() === matchArchiveFolderId) {
        const monthFolders = DriveApp.getFoldersByName(`${eventDate.getUTCMonth() + 1}. ${monthName}`);
        while (monthFolders.hasNext()) {
          let monthFolder = monthFolders.next();
          let monthFolderParent = monthFolder.getParents().next();
          if (monthFolderParent.getId() === yearFolder.getId()) {
            let fileToRemove = DriveApp.getFileById(sheetID);
            fileToRemove.moveTo(monthFolder);
            break;
          }
        }
      }
    }
  }
}

function findDiscordUserByEmail(ovosheet, email, accountType) {
  if (accountType === observerAccountsType) {
    let obsContacts = ovosheet.getSheetByName(repObsContactTabName);
    let obsResult = fetchDiscordIdFromSheet(obsContacts, email);
    return obsResult;
  } else {
    let outfits = ovosheet.getSheetByName(repOutfitTabName);
    let repResult = fetchDiscordIdFromSheet(outfits, email);
    if (repResult === 'None_Found') {
      let communities = ovosheet.getSheetByName(repCommunityTabName);
      let communityRepResult = fetchDiscordIdFromSheet(communities, email);
      return communityRepResult;
    } else {
      return repResult;
    }
  }
}

function fetchDiscordIdFromSheet(contacts, email) {
  let maxEntries = contacts.getMaxRows() - 1;
  let emailEntries = contacts.getRange(2, 3, maxEntries).getValues();
  for (var i = 0; i < emailEntries.length; i++) {
    if (emailEntries[i] == email) {
      let correctCell = i + 2;
      return contacts.getRange(`E${correctCell}`).getValue();
    }
  }
  return 'None_Found';
}

function determineAccountsType(requestType) {
  if (requestType === observerAccountsType) {
    return obsMessage;
  } else if (requestType === normalAccountsType) {
    return accountMessage;
  }
}

function getEmailErrorMessage(docName) {
  let contents = `Oh no, I cannot find any emails to send accounts for ${docName}, <@&${ovoStaffDiscordGroupID}> Help!`;
  return contents;
}

function getNotEmailError(docName) {
  let contents = `The emails supplied in ${docName} are incorrect or can't be found, <@&${ovoStaffDiscordGroupID}> Help!`;
  return contents;
}

function getTimeErrorMessage(docName) {
  let contents = `Oh no, someone bring a timemachine as I don't understand ${docName}, <@&${ovoStaffDiscordGroupID}> Help!`;
  return contents;
}


function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}



