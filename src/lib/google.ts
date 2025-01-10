import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  keyFile: "service-account-key.json",
  scopes: ["https://www.googleapis.com/auth/drive"],
});

export const drive = google.drive({ version: "v3", auth });