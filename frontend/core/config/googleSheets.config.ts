import { google, sheets_v4 } from "googleapis";

/**
 * System-level Google Sheets client configuration.
 *
 * Required environment variables (fill these in .env.local):
 * - GOOGLE_SHEETS_CLIENT_EMAIL: Service account email
 * - GOOGLE_SHEETS_PRIVATE_KEY: Service account private key
 * - GOOGLE_SHEETS_SPREADSHEET_ID: Target spreadsheet ID
 * - GOOGLE_SHEETS_SHEET_NAME: Target sheet/tab name (defaults to "Sheet1")
 */

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

export const GOOGLE_SHEETS_SHEET_NAME =
  process.env.GOOGLE_SHEETS_SHEET_NAME || "Sheet1";

export const GOOGLE_SHEETS_SPREADSHEET_ID =
  process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";

let cachedClient: sheets_v4.Sheets | null = null;

/**
 * Returns an authenticated Google Sheets API client.
 * The client is cached across invocations to avoid re-authenticating.
 */
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
