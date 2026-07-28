import { google, sheets_v4 } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export const GOOGLE_SHEETS_SHEET_NAME =
  process.env.GOOGLE_SHEETS_SHEET_NAME || "Sheet1";

export const GOOGLE_SHEETS_SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";

let cachedClient: sheets_v4.Sheets | null = null;

export const getGoogleSheetsClient = (): sheets_v4.Sheets => {
  if (cachedClient) {
    return cachedClient;
  }

  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );

  if (!clientEmail || !privateKey || !GOOGLE_SHEETS_SPREADSHEET_ID) {
    throw new Error(
      "Missing Google Sheets configuration. Please set GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY and GOOGLE_SHEETS_SPREADSHEET_ID in your environment.",
    );
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: SCOPES,
  });

  cachedClient = google.sheets({ version: "v4", auth });
  return cachedClient;
};
