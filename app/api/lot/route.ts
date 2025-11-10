import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { findByLot, appendToB, mergeRow } from "@/lib/sheets";

const PostBody = z.object({
  "lot no": z.string().min(1),
  "ürün kodu": z.string().optional(),
  "raf": z.string().optional(),
  "metraj": z.string().optional(),
});

export const dynamic = "force-dynamic";

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

    return NextResponse.json(
      { ok: true, action: "added", data: completed },
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: err.message ?? "Unknown error" }, { status: 500 });
  }
}
