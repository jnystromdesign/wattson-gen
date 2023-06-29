const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Auth } = require("googleapis");

// This function will be triggered when a new form submission is received
exports.submitFormData = functions.https.onRequest(async (req, res) => {
  admin.initializeApp();
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
    console.error("Error:", error);
    res.status(500).send("An error occurred while inserting form data");
  }
});
