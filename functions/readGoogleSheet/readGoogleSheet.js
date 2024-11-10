const googleSheetId = process.env.GOOGLE_SHEET_ID;
const googleSheetPage = process.env.GOOGLE_SHEET_PAGE;

const { google } = require('googleapis');
exports.handler = async function (context, event, callback) {

  const clientEmail = process.env.GOOGLE_MAIL;
  const privateKeyPartsCt = process.env.GOOGLE_PRIVATE_KEY_PARTS;

  let privateKey = "";
  for (let i = 0; i < privateKeyPartsCt; i++) {
    let envVar = "GOOGLE_PRIVATE_KEY_" + i;
    privateKey += process.env[envVar];
  }

  // authenticate the service account
  const googleAuth = new google.auth.JWT(
    clientEmail,
    null,
    privateKey.split(String.raw`\n`).join('\n'),
    'https://www.googleapis.com/auth/spreadsheets'
  );

  let phoneNumbers = await readSheet(googleAuth)
  callback(null, phoneNumbers);
};


async function readSheet(googleAuth) {
  try {
    // google sheet instance
    const sheetInstance = await google.sheets({ version: 'v4', auth: googleAuth});
    // read data in the range in a sheet
    const infoObjectFromSheet = await sheetInstance.spreadsheets.values.get({
        auth: googleAuth,
        spreadsheetId: googleSheetId,
        range: `${googleSheetPage}!A2:A99999`
    });
    
    const valuesFromSheet = infoObjectFromSheet.data.values;
    return valuesFromSheet;
  }
  catch(err) {
    console.error("readSheet func() error", err);  
  }
}
