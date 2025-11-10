import { google } from "googleapis";

const { SHEET_ID, GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, SHEET_NAME_A, SHEET_NAME_B } = process.env;

if (!SHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !SHEET_NAME_A || !SHEET_NAME_B) {
  throw new Error("Missing env vars: SHEET_ID / GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY / SHEET_NAME_A / SHEET_NAME_B");
}

export type RowData = {
  "lot no": string;
  "ürün kodu": string;
  "raf": string;
  "metraj": string;
};

export type FoundResult =
  | { foundIn: "A" | "B"; rowIndex: number; data: RowData }
  | { foundIn: null };

function getAuth() {
  const privateKey = (GOOGLE_PRIVATE_KEY as string).replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email: GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

function toRowData(values: any[]): RowData {
  const s = (v: any) => (v === null || v === undefined ? "" : String(v));
  return {
    "lot no": s(values[0]),
    "ürün kodu": s(values[1]),
    "raf": s(values[2]),
    "metraj": s(values[3]),
  };
}

export async function getAllRows(sheetName: string): Promise<RowData[]> {
  const sheets = await getSheets();
  const range = `${sheetName}!A2:D`; 
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID!,
    range,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const rows = (res.data.values ?? []) as string[][];
  return rows.map(toRowData);
}


export async function findByLot(sheetName: string, lotNo: string): Promise<{ rowIndex: number; data: RowData } | null> {
  const rows = await getAllRows(sheetName);
  const idx = rows.findIndex(r => (r["lot no"] ?? "").toString() === lotNo.toString());
  if (idx === -1) return null;
  return { rowIndex: idx, data: rows[idx] };
}

export async function appendToB(data: RowData) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID!,
    range: `${SHEET_NAME_B}!A2:D`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[data["lot no"], data["ürün kodu"], data["raf"], data["metraj"]]] },
  });
}

export async function updateB(rowIndex: number, data: RowData) {
  const sheets = await getSheets();
  const startRow = rowIndex + 2;
  const range = `${SHEET_NAME_B}!A${startRow}:D${startRow}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID!,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[data["lot no"], data["ürün kodu"], data["raf"], data["metraj"]]] },
  });
}

export function mergeRow(base: RowData, patch: Partial<RowData>): RowData {
  return {
    "lot no": base["lot no"],
    "ürün kodu": patch["ürün kodu"] ?? base["ürün kodu"],
    "raf": patch["raf"] ?? base["raf"],
    "metraj": patch["metraj"] ?? base["metraj"],
  };
}
