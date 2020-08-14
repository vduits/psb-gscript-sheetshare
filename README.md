# psb-gscript-sheetshare

This is a [Google Appscript](https://developers.google.com/apps-script) project that aims to share google sheets containing Daybreak Games accounts to specific users in an automatic fashion. One of the many endeavours to reduce the amount of work for PSB staff.

This project is developed using [Google Clasp](https://github.com/google/clasp). 
I can recommend using this in conjunction with [Visual Studio Code](https://code.visualstudio.com/).

## Structure
This project does not use any libraries, mainly to keep it simple for novice javascript developers and plain convenience of not requiring any Google Cloud Platform project.

The main piece of code can be found in `Code.js`.
Other sections of code have been split into multiple files where deemed appropiate, though more refactoring and clarity of where they have been split into is desired.

Sensitive configuration has been moved to `Config.js` which can be created using `Config-example.js`.

## Overview of functionality
The top level function `RunOvOFolderSequence()` runs once every 15 minutes using [Appscript Trigger](https://script.google.com/home/triggers).
This will check the OvO and Obs configured folders for files that fit the template format and check their contents for when to release the sheet to the correct user.

In order for the sheet to get sent the following is checked:

* Is the document title starting with the current year (2020)?
* Is there an email for the representative (semicolon seperated if multiple)?
* Does the request date match the current date or the past?
* Does the current UTC time + 4 hours pass the requested time?
* Is the shared status empty?

If all these conditions are met, the document will be shared with the email(s) listed on top.

An example file called `!Template.xlsx` has been provided that contains the correct formatting.