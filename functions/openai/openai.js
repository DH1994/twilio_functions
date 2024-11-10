exports.handler = async function (context, event, callback) {

  const companyName = process.env.COMPANY_NAME;
  const inMsg = event.Body || "Vertel wat over bedrijf " + companyName
  let msg = await fetchDuckDuckAi(inMsg);
  callback(null, msg);

};

const fetchDuckDuckAi = async (questionSt) => {
  let vqdHeaderSt;
  const statusResponse = await fetch("https://duckduckgo.com/duckchat/v1/status", {
    "headers": {
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
      "x-vqd-accept": 1
    },
    "body": null,
    "method": "GET"
  });

  let headers = await statusResponse.headers
  let vqdHeader = "";

  if (headers.has("x-vqd-4")) {
    vqdHeader = headers.get("x-vqd-4")
  }
  else {
    throw Error("vqd error not found")
  }

  let aiResponse = await fetch("https://duckduckgo.com/duckchat/v1/chat", {
    "headers": {
      "accept": "text/event-stream",
      "x-vqd-4": vqdHeader,
      "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
      "content-type": "application/json"
    },
    "body": "{\"model\":\"gpt-4o-mini\",\"messages\":[{\"role\":\"user\",\"content\":\"" + questionSt + "\"}]}",
    "method": "POST"
  })

  await aiResponse;
  let aiResponseSt = "";
  (await aiResponse.text()).split("data:").
    forEach(element => {
      try {
        if (element) {
          elementJson = JSON.parse(element)
          if (elementJson.message) {
            aiResponseSt += elementJson.message
          }
        }
      }
      catch (Error) { }
    });
  return aiResponseSt;
}