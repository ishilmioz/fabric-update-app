// app/page.tsx
"use client";

import { useState } from "react";

type RowData = {
  "lot no": string;
  "ürün kodu": string;
  "raf": string;
  "metraj": string;
};

export default function Home() {
  const [lotNo, setLotNo] = useState("");
  const [urunKodu, setUrunKodu] = useState("");
  const [raf, setRaf] = useState("");
  const [metraj, setMetraj] = useState("");

  const [foundIn, setFoundIn] = useState<"A" | "B" | null>(null);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSearch() {
    setLoading(true);
    setMsg("");

    const res = await fetch(`/api/lot/${lotNo}`);
    const json = await res.json();

    if (json.foundIn === "A" || json.foundIn === "B") {
      const d = json.data as RowData;

      setUrunKodu(d["ürün kodu"]);
      setRaf(d["raf"]);
      setMetraj(d["metraj"]);

      setFoundIn(json.foundIn);
      setLocked(true); // lot no kilitle
      setMsg(json.foundIn === "B" ? "B'de bulundu. Güncelle yapılabilir." : "A'da bulundu. Eklenebilir.");
    } else {
      setFoundIn(null);
      setMsg("Kayıt bulunamadı.");
    }

    setLoading(false);
  }

  async function handleAdd() {
    setLoading(true);
    setMsg("");

    const body = {
      "lot no": lotNo,
      "ürün kodu": urunKodu,
      "raf": raf,
      "metraj": metraj,
    };

    const res = await fetch(`/api/lot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (json.ok) {
      setMsg("Başarıyla eklendi!");
      setFoundIn("B");
    } else {
      setMsg(json.error || "Hata");
    }
    setLoading(false);
  }

  async function handleUpdate() {
    setLoading(true);
    setMsg("");

    const body = {
      "ürün kodu": urunKodu,
      "raf": raf,
      "metraj": metraj,
    };

    const res = await fetch(`/api/lot/${lotNo}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (json.ok) {
      setMsg("Güncellendi!");
    } else {
      setMsg(json.error || "Hata");
    }
    setLoading(false);
  }

  function resetAll() {
    setLotNo("");
    setUrunKodu("");
    setRaf("");
    setMetraj("");

    setFoundIn(null);
    setLocked(false);
    setMsg("");
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h2>Lot Sorgulama</h2>

      <label>Lot No</label><br/>
      <input
        value={lotNo}
        onChange={(e) => setLotNo(e.target.value)}
        disabled={locked}
        style={{ width: "100%", marginBottom: 10 }}
      />

      <button onClick={handleSearch} disabled={!lotNo || loading}>Sorgula</button>
      <button onClick={resetAll} style={{ marginLeft: 10 }}>Temizle</button>

      <hr />

      <label>Ürün Kodu</label><br/>
      <input value={urunKodu} onChange={(e) => setUrunKodu(e.target.value)} style={{ width: "100%", marginBottom: 10 }}/>

      <label>Raf</label><br/>
      <input value={raf} onChange={(e) => setRaf(e.target.value)} style={{ width: "100%", marginBottom: 10 }}/>

      <label>Metraj</label><br/>
      <input value={metraj} onChange={(e) => setMetraj(e.target.value)} style={{ width: "100%", marginBottom: 10 }}/>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={handleAdd}
          disabled={foundIn !== "A" || loading}
        >
          Ekle
        </button>

        <button
          onClick={handleUpdate}
          disabled={foundIn !== "B" || loading}
          style={{ marginLeft: 10 }}
        >
          Güncelle
        </button>
      </div>

      {msg && <p style={{ marginTop: 20 }}>{msg}</p>}
    </div>
  );
}
