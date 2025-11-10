import { NextResponse } from "next/server";
import { z } from "zod";
import { findByLot, updateB, mergeRow, RowData } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PutBody = z.object({
  "ürün kodu": z.coerce.string().optional(),
  "raf": z.coerce.string().optional(),
  "metraj": z.coerce.string().optional(),
});


export async function GET(req: Request, context: { params: Promise<{ lotNo: string }> }) {
  try {
    
    const { lotNo } = await context.params;

    
    const inB = await findByLot(process.env.SHEET_NAME_B!, lotNo);
    if (inB) {
      return NextResponse.json({ foundIn: "B", data: inB.data, rowIndex: inB.rowIndex });
    }

    const inA = await findByLot(process.env.SHEET_NAME_A!, lotNo);
    if (inA) {
      return NextResponse.json({ foundIn: "A", data: inA.data, rowIndex: inA.rowIndex });
    }

    return NextResponse.json({ foundIn: null });
  } catch (err: any) {
    if (err?.issues) {
      const msg = err.issues
        .map((i: any) => (i?.message ? String(i.message) : JSON.stringify(i)))
        .join(" | ");
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    console.error(err);
    const message = typeof err?.message === "string" ? err.message : JSON.stringify(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


export async function PUT(req: Request, context: { params: Promise<{ lotNo: string }> }) {
  try {
    const { lotNo } = await context.params;

 
    const inB = await findByLot(process.env.SHEET_NAME_B!, lotNo);
    if (!inB) {
      return NextResponse.json(
        { error: "Bu lot B sayfasında bulunamadı; güncellenecek kayıt yok.", foundIn: null },
        { status: 404 }
      );
    }

    const patch = PutBody.parse(await req.json());
    const merged: RowData = mergeRow({ ...inB.data, "lot no": lotNo }, patch);

    await updateB(inB.rowIndex, merged);

    return NextResponse.json({ ok: true, action: "updated", data: merged }, { status: 200 });
  } catch (err: any) {
    if (err?.issues) {
      const msg = err.issues
        .map((i: any) => (i?.message ? String(i.message) : JSON.stringify(i)))
        .join(" | ");
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    console.error(err);
    const message = typeof err?.message === "string" ? err.message : JSON.stringify(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
