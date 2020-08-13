const botName = 'Edward';

function sharedMessenger(docName, targetMessage, discordUserList) {
    let contents;
    let longThing = "";
    if(discordUserList.length > 0){
      for(var i = 0; i<discordUserList.length;i++){
        let discordId = discordUserList[i];
        longThing += `<@${discordId}>`
      }
      contents = `Hi ${longThing}. ${targetMessage} been sent for ${docName}, please check ${standardDriveLink}.`;
    }else{
      contents = `${targetMessage} been sent for ${docName}, please check ${standardDriveLink}.`;
    }  
    discordMessenger(contents); 
  }

function discordMessenger(contents){
    let theMessage = prepareMessage(contents);
    let options = prepareRequest(theMessage);
    UrlFetchApp.fetch(discordBotChannelWebhook, options); 
}


function prepareMessage(messageContents){
    return data = {
      'username': botName,
      'content': messageContents,
      'avatar_url': discordBotPicture
    };  
  }
  
  function prepareRequest(data){
    return {
      'method' : 'post',
      'contentType': 'application/json',
      'payload' : JSON.stringify(data)
    };  
  }
