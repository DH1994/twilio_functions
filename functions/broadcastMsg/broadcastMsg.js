const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";
const { Reject } = require("twilio/lib/twiml/VoiceResponse");

const testUrl = process.env.TEST_URL || false;
const messagingServiceSid = process.env.MESSAGING_SERVICE_SID;

exports.handler = async function (context, event, callback) {

  // Find your Account SID and Auth Token at twilio.com/console
  // and set the environment variables. See http://twil.io/secure
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  let client;
  if (!testUrl)
    client = twilio(accountSid, authToken);

  // FUNCTION PARAMETERS
  let inputMsg;
  let phoneNumbers;
  if ("inputMsg" in event)
    inputMsg = event.inputMsg;
  else
    throw (Error("No inputMsg defined"))

  if ("phoneNumbers" in event) {
    phoneNumbers = JSON.parse(event.phoneNumbers);
  }
  else {
    throw (Error("No phoneNumbers defined"));
  }

  const sendMessages = async () => {
    for (const phoneNr of phoneNumbers) {
      if (!testUrl)
        await createMessage(phoneNr, inputMsg);
      else
        await createMessageTest(phoneNr[0], inputMsg)
    }
  }
  await sendMessages();
  callback(null, {});
};

async function createMessage(phoneNr, message) {
  const sendMsg = await client.messages.create({
    body: message,
    messagingServiceSid: messagingServiceSid,
    to: phoneNr,
  });
}

async function createMessageTest(phoneNr, message) {
  var url = new URL(testUrl);
  url.searchParams.append("phone", phoneNr)
  url.searchParams.append("message", message)

  const test = await fetch(url, {
    "body": null,
    "method": "GET"
  });

  await test.ok;
}