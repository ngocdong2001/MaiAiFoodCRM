"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoogleSheetsClient = exports.GOOGLE_SHEETS_SPREADSHEET_ID = exports.GOOGLE_SHEETS_SHEET_NAME = void 0;
const googleapis_1 = require("googleapis");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
exports.GOOGLE_SHEETS_SHEET_NAME = process.env.GOOGLE_SHEETS_SHEET_NAME || "Sheet1";
exports.GOOGLE_SHEETS_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";
let cachedClient = null;
const getGoogleSheetsClient = () => {
    if (cachedClient) {
        return cachedClient;
    }
    const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (!clientEmail || !privateKey || !exports.GOOGLE_SHEETS_SPREADSHEET_ID) {
        throw new Error("Missing Google Sheets configuration. Please set GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY and GOOGLE_SHEETS_SPREADSHEET_ID in your environment.");
    }
    const auth = new googleapis_1.google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: SCOPES,
    });
    cachedClient = googleapis_1.google.sheets({ version: "v4", auth });
    return cachedClient;
};
exports.getGoogleSheetsClient = getGoogleSheetsClient;
