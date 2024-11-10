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

  const fromUser = event.From || "nobody";
  const msg = event.Body || "no message"
  let reply;

  if ("aiMessage" in event)
    reply = event.aiMessage
  else
    throw(Error("No aiMessage retrieved"))

  rowArray = [
    [fromUser, msg, reply]
  ];

  await appendSheet(googleAuth, rowArray)
  callback(null, {});
};

async function appendSheet(googleAuth, rowArray) {
  try {
    // google sheet instance
    const sheetInstance = await google.sheets({ version: 'v4', auth: googleAuth });

    // update data in the range
    await sheetInstance.spreadsheets.values.append({
      auth: googleAuth,
      spreadsheetId: googleSheetId,
      range: `${googleSheetPage}`,
      valueInputOption: 'RAW',
      resource: {
        values: rowArray,
      },
    });
  }
  catch (err) {
    console.error("updateSheet func() error", err);
  }
}
