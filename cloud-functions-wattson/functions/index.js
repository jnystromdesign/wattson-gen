/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Auth } = require("googleapis");
const { onRequest } = require("firebase-functions/v2/https");

admin.initializeApp();
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addmessage = onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  // Send back a message that we've successfully written the message
  res.json({ result: `Message sent and it was: "${original}".` });
});

exports.postToSheet = onRequest(async (req, res) => {
  const { name, email, message } = req.body;

  res.json({ result: `Message sent and it was: "${(name, email, message)}".` });
});



// This function will be triggered when a new form submission is received
exports.submitFormData = functions.https.onRequest(async (req, res) => {

  try {
    // Get the form data from the request body
    const { name, email, message } = req.body;

    // Create a new row with the form data
    const rowData = [name, email, message];

    // Get the Google Sheets API credentials
    const credentials = await admin
      .firestore()
      .collection("credentials")
      .doc("google-sheets")
      .get();
    const { client_email, private_key } = credentials.data();

    // Configure the JWT client
    const jwtClient = new Auth.JWT(client_email, null, private_key, [
      "https://www.googleapis.com/auth/spreadsheets",
    ]);

    // Authorize the client
    await jwtClient.authorize();

    // Create a new instance of the Sheets API
    const sheets = google.sheets({ version: "v4", auth: jwtClient });

    // Define the spreadsheet ID and range
    const spreadsheetId = "1YUms5Tm6CAPTBtGDXsNFVbUOfNfezqGYUtU-BL0Nbd8";
    const range = "Sheet1!A1:C1"; // Modify the range as per your sheet structure

    // Append the data to the spreadsheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      resource: { values: [rowData] },
    });

    res.status(200).send("Form data successfully inserted into Google Sheet");
  } catch (error) {
    console.log('----VERY ERRROR-----')
    console.error("Error:", error);
    res.status(500).send("An error occurred while inserting form data");
  }
});
