"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoModel = void 0;
const googleSheets_config_1 = require("../config/googleSheets.config");
// Columns order written to the sheet: id, timestamp, firstName, lastName, email, salonName
const SHEET_RANGE = `${googleSheets_config_1.GOOGLE_SHEETS_SHEET_NAME}!A:F`;
const formatTimestamp = (date) => new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
}).format(date);
exports.InfoModel = {
    async create(data) {
        const newRecord = {
            id: Date.now().toString(),
            timestamp: formatTimestamp(new Date()),
            ...data,
        };
        const sheets = (0, googleSheets_config_1.getGoogleSheetsClient)();
        await sheets.spreadsheets.values.append({
            spreadsheetId: googleSheets_config_1.GOOGLE_SHEETS_SPREADSHEET_ID,
            range: SHEET_RANGE,
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            requestBody: {
                values: [
                    [
                        newRecord.id,
                        newRecord.timestamp,
                        newRecord.firstName,
                        newRecord.lastName,
                        newRecord.email,
                        newRecord.salonName,
                    ],
                ],
            },
        });
        return newRecord;
    },
    async getAll() {
        const sheets = (0, googleSheets_config_1.getGoogleSheetsClient)();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: googleSheets_config_1.GOOGLE_SHEETS_SPREADSHEET_ID,
            range: SHEET_RANGE,
        });
        const rows = response.data.values ?? [];
        return rows.map((row) => ({
            id: row[0] ?? "",
            timestamp: row[1] ?? "",
            firstName: row[2] ?? "",
            lastName: row[3] ?? "",
            email: row[4] ?? "",
            salonName: row[5] ?? "",
        }));
    },
};
