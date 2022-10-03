import fetch from "node-fetch";
import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

console.log("process.env.CLIENT_ID: ", process.env.CLIENT_ID);

export function authorizeRteAndGetSignal() {
  // Call the API
  const token = Buffer.from(`${process.env.CLIENT_ID}:${process.env.ID_SECRET}`).toString("base64");
  // This is a POST request, because we need the API to generate a new token for us
  fetch("https://digital.iservices.rte-france.com/token/oauth/", {
    method: "POST",
    // body: `grant_type=client_credentials&client_id=${process.env.CLIENT_ID}&client_secret=${process.env.ID_SECRET}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${token}`,
    },
  })
    .then(function (resp) {
      // Return the response as JSON
      return resp.json();
    })
    .then(function (data: any) {
      // Log the API data

      // Return a second API call
      // This one uses the token we received for authentication
      return fetch("https://digital.iservices.rte-france.com/open_api/ecowatt/v4/signals", {
        headers: {
          Authorization: `${data.token_type} ${data.access_token}`,
          "Content-Type": "application/json",
        },
      });
    })
    .then(function (resp) {
      // Return the API response as JSON
      return resp.json();
    })
    .then(function (data) {
      // Log the pet data
      console.log("signal", data);

      // stringify JSON Object
      var jsonContent = JSON.stringify(data, null, 2);

      fs.writeFile("signal.json", jsonContent, "utf8", function (err) {
        if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
        }

        console.log("JSON file has been saved.");
      });
    })
    .catch(function (err) {
      // Log any errors
      console.log("something went wrong", err);
    });
}

authorizeRteAndGetSignal();
