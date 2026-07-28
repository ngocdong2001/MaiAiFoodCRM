import { NextRequest, NextResponse } from "next/server";

import {
  getGoogleSheetsClient,
  GOOGLE_SHEETS_SPREADSHEET_ID,
  GOOGLE_SHEETS_SHEET_NAME,
} from "@/core/config/googleSheets.config";

type InfoFormData = {
  firstName: string;
  lastName: string;
  email: string;
  salonName: string;
};

type InfoRecord = InfoFormData & {
  id: string;
  timestamp: string;
};

// Columns order written to the sheet: id, timestamp, firstName, lastName, email, salonName
const SHEET_RANGE = `${GOOGLE_SHEETS_SHEET_NAME}!A:F`;

// Format a date into a human-readable string (e.g. "24/07/2026 14:30:45")
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

// POST: Append new info to the Google Sheet
export async function POST(request: NextRequest) {
  try {
    const body: InfoFormData = await request.json();

    // Validate required fields
    const { firstName, lastName, email, salonName } = body;

    if (!firstName || !lastName || !email || !salonName) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 },
      );
    }

    // Create new record
    const newRecord: InfoRecord = {
      id: Date.now().toString(),
      timestamp: formatTimestamp(new Date()),
      firstName,
      lastName,
      email,
      salonName,
    };

    // Append to Google Sheet
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

    return NextResponse.json(
      {
        success: true,
        message: "Info saved successfully",
        data: newRecord,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save info",
      },
      { status: 500 },
    );
  }
}

// GET: Retrieve all info records from the Google Sheet
export async function GET() {
  try {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: SHEET_RANGE,
    });

    const rows = response.data.values ?? [];

    const data: InfoRecord[] = rows.map((row) => ({
      id: row[0] ?? "",
      timestamp: row[1] ?? "",
      firstName: row[2] ?? "",
      lastName: row[3] ?? "",
      email: row[4] ?? "",
      salonName: row[5] ?? "",
    }));

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve info",
      },
      { status: 500 },
    );
  }
}
