import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { findByLot, appendToB, mergeRow } from "@/lib/sheets";

export const dynamic = "force-dynamic";

const PostBody = z.object({
  "lot no": z.coerce.string().min(1),   // <- coerce
  "ürün kodu": z.coerce.string().optional(),
  "raf": z.coerce.string().optional(),
  "metraj": z.coerce.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = PostBody.parse(await req.json());
    const lotNo = body["lot no"];

    const inB = await findByLot(process.env.SHEET_NAME_B!, lotNo);
    if (inB) {
      return NextResponse.json(
        { error: "Bu lot B sayfasında zaten var; eklemek yerine güncellemelisiniz.", foundIn: "B" },
        { status: 409 }
      );
    }

    const inA = await findByLot(process.env.SHEET_NAME_A!, lotNo);
    if (!inA) {
      return NextResponse.json(
        { error: "Lot A sayfasında bulunamadı; A'da olmayan bir lot eklenemez.", foundIn: null },
        { status: 400 }
      );
    }

    const completed = mergeRow(inA.data, {
      "ürün kodu": body["ürün kodu"],
      "raf": body["raf"],
      "metraj": body["metraj"],
    });

    await appendToB(completed);

    return NextResponse.json({ ok: true, action: "added", data: completed }, { status: 201 });
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
