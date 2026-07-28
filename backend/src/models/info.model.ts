import {
  getGoogleSheetsClient,
  GOOGLE_SHEETS_SPREADSHEET_ID,
  GOOGLE_SHEETS_SHEET_NAME,
} from "../config/googleSheets.config";

export type InfoFormData = {
  firstName: string;
  lastName: string;
  email: string;
  salonName: string;
};

export type InfoRecord = InfoFormData & {
  id: string;
  timestamp: string;
};

// Columns order written to the sheet: id, timestamp, firstName, lastName, email, salonName
const SHEET_RANGE = `${GOOGLE_SHEETS_SHEET_NAME}!A:F`;

const formatTimestamp = (date: Date): string =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);

export const InfoModel = {
  async create(data: InfoFormData): Promise<InfoRecord> {
    const newRecord: InfoRecord = {
      id: Date.now().toString(),
      timestamp: formatTimestamp(new Date()),
      ...data,
    };

    const sheets = getGoogleSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
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

  async getAll(): Promise<InfoRecord[]> {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
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
