"use client";

import { useState, useCallback } from "react";

// Hata/mesaj stringleştirici
function toMsg(e: any): string {
  if (!e) return "";
  if (typeof e === "string") return e;
  if (Array.isArray(e)) return e.map(toMsg).join(" | ");
  if (typeof e === "object") {
    if (e.message && typeof e.message === "string") return e.message;
    try {
      return JSON.stringify(e);
    } catch {
      return "Bilinmeyen hata";
    }
  }
  return String(e);
}

type RowData = {
  "lot no": string;
  "ürün kodu": string;
  "raf": string;
  "metraj": string;
};

export default function Page() {
  // Form state
  const [lotNo, setLotNo] = useState("");
  const [urunKodu, setUrunKodu] = useState("");
  const [raf, setRaf] = useState("");
  const [metraj, setMetraj] = useState("");

  // UI state
  const [foundIn, setFoundIn] = useState<"A" | "B" | null>(null);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const [msgType, setMsgType] = useState<"info" | "success" | "warning" | "error" | null>(null);

  const resetAll = useCallback(() => {
    setLotNo("");
    setUrunKodu("");
    setRaf("");
    setMetraj("");
    setFoundIn(null);
    setLocked(false);
    setMsg("");
    setMsgType(null);
  }, []);

  function setBanner(text: any, type: "info" | "success" | "warning" | "error") {
    setMsg(toMsg(text));
    setMsgType(type);
  }

  async function handleSearch() {
    if (!lotNo) return;
    setLoading(true);
    setBanner("", "info");
    try {
      const res = await fetch(`/api/lot/${encodeURIComponent(lotNo)}`);
      const json = await res.json();
      if (json.foundIn === "A" || json.foundIn === "B") {
        const d = json.data as RowData;
        setUrunKodu(d["ürün kodu"] ?? "");
        setRaf(d["raf"] ?? "");
        setMetraj(d["metraj"] ?? "");
        setFoundIn(json.foundIn);
        setLocked(true);
        setBanner(
          json.foundIn === "B"
            ? "B'de bulundu. Güncelleme yapılabilir."
            : "A'da bulundu. Eklenebilir.",
          json.foundIn === "B" ? "success" : "info"
        );
      } else {
        setFoundIn(null);
        setBanner("Kayıt bulunamadı.", "warning");
      }
    } catch (e: any) {
      setBanner(e?.message || e, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    setLoading(true);
    setBanner("", "info");
    try {
      const res = await fetch(`/api/lot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "lot no": lotNo,
          "ürün kodu": urunKodu,
          "raf": raf,
          "metraj": metraj,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setFoundIn("B");
        setBanner("Başarıyla eklendi!", "success");
      } else {
        setBanner(json.error || "Hata", "error");
      }
    } catch (e: any) {
      setBanner(e?.message || e, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate() {
    setLoading(true);
    setBanner("", "info");
    try {
      const res = await fetch(`/api/lot/${encodeURIComponent(lotNo)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "ürün kodu": urunKodu,
          "raf": raf,
          "metraj": metraj,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setBanner("Güncellendi!", "success");
      } else {
        setBanner(json.error || "Hata", "error");
      }
    } catch (e: any) {
      setBanner(e?.message || e, "error");
    } finally {
      setLoading(false);
    }
  }

  // Enter kısayolu:
  function handleKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (!locked) return handleSearch();
    if (foundIn === "A") return handleAdd();
    if (foundIn === "B") return handleUpdate();
  }

  const canAdd = foundIn === "A" && !loading;
  const canUpdate = foundIn === "B" && !loading;

  return (
    <div className="page">
      <div className="card">
        <h2>Lot İşlemleri</h2>

        {msg && (
          <div className={`alert ${msgType ?? "info"}`} role="status">
            {msg}
          </div>
        )}

        <form onKeyDown={handleKeyDown} className="form">
          <div className="field">
            <label>Lot No</label>
            <input
              value={lotNo}
              onChange={(e) => setLotNo(e.target.value)}
              disabled={locked || loading}
              placeholder="Örn: 9001"
            />
          </div>

          <div className="row">
            <div className="field">
              <label>Ürün Kodu</label>
              <input
                value={urunKodu}
                onChange={(e) => setUrunKodu(e.target.value)}
                disabled={loading}
                placeholder="Ürün kodu"
              />
            </div>
            <div className="field">
              <label>Raf</label>
              <input
                value={raf}
                onChange={(e) => setRaf(e.target.value)}
                disabled={loading}
                placeholder="Raf"
              />
            </div>
            <div className="field">
              <label>Metraj</label>
              <input
                value={metraj}
                onChange={(e) => setMetraj(e.target.value)}
                disabled={loading}
                placeholder="Metraj"
              />
            </div>
          </div>

          <div className="actions">
            <button
              type="button"
              className={`btn primary ${canAdd ? "" : "disabled"}`}
              onClick={handleAdd}
              disabled={!canAdd}
              title={canAdd ? "B'ye ekle" : "Ekle pasif"}
            >
              {loading && foundIn === "A" ? <span className="spinner" /> : null}
              Ekle
            </button>

            <button
              type="button"
              className={`btn success ${canUpdate ? "" : "disabled"}`}
              onClick={handleUpdate}
              disabled={!canUpdate}
              title={canUpdate ? "B'de güncelle" : "Güncelle pasif"}
            >
              {loading && foundIn === "B" ? <span className="spinner" /> : null}
              Güncelle
            </button>

            <button
              type="button"
              className="btn ghost"
              onClick={resetAll}
              disabled={loading}
            >
              Temizle
            </button>

            <button
              type="button"
              className="btn outline"
              onClick={handleSearch}
              disabled={!lotNo || loading}
              title={!lotNo ? "Lot no gerekli" : "Sorgula"}
            >
              {loading && !locked ? <span className="spinner" /> : null}
              Sorgula
            </button>
          </div>
        </form>
      </div>


      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #4a5688ff;
          padding: 24px;
        }
        .card {
          width: 100%;
          max-width: 840px;
          background: #3b3b6dff;
          border: 2px solid #e6e8ef; 
          border-radius: 16px;
          box-shadow: 0 10px 24px rgba(20, 24, 40, 0.08);
          padding: 24px;
        }
        h2 {
          margin: 0 0 16px;
          font-weight: 700;
        }
        .alert {
          margin-bottom: 16px;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid transparent;
          font-size: 14px;
        }
        .alert.info {
          background: #e8f1ff;
          border-color: #b8d2ff;
          color: #143b8f;
        }
        .alert.success {
          background: #e9fbef;
          border-color: #c3f3d1;
          color: #165b31;
        }
        .alert.warning {
          background: #fff7e6;
          border-color: #ffe0a6;
          color: #7a4b00;
        }
        .alert.error {
          background: #ffeaea;
          border-color: #ffc5c5;
          color: #8f1919;
        }
        .form { display: grid; gap: 16px; }
        .row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        .field { display: grid; gap: 6px; }
        label { font-size: 13px; color: #ffffffff; }
        input {
          height: 40px;
          padding: 8px 12px;
          border-radius: 10px;
          border: 2px solid #d7dbe7; 
          outline: none;
          transition: box-shadow 0.15s ease, border-color 0.15s ease;
          background: #fff;
        }

        input {
          color: #111827; /* girilen yazı */
        }

        input::placeholder {
          color: #6b7280; /* placeholder */
        }

        input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
        }
        input:disabled {
          background: #f2f4f8;
          color: #7a8497;
        }

        .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
        .btn {
          position: relative;
          height: 40px;
          padding: 0 14px;
          border-radius: 12px;
          border: 2px solid transparent;
          font-weight: 600;
          box-shadow: 0 6px 14px rgba(30, 41, 59, 0.12);
          transition: transform 0.06s ease, box-shadow 0.15s ease, opacity 0.15s ease;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #e5e7eb;
        }
        .btn:hover { transform: translateY(-1px); }
        .btn:active { transform: translateY(0); box-shadow: 0 3px 8px rgba(30,41,59,0.2); }
        .btn.disabled, .btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          box-shadow: 0 2px 6px rgba(30,41,59,0.08);
        }
        .btn.primary { background: #2563eb; color: #fff; border-color: #1d4ed8; }
        .btn.success { background: #16a34a; color: #fff; border-color: #15803d; }
        .btn.outline { background: #fff; color: #111827; border-color: #cbd5e1; }
        .btn.ghost { background: #f1f5f9; color: #111827; border-color: #e2e8f0; }

        .spinner {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.6);
          border-top-color: rgba(255,255,255,1);
          animation: spin 0.9s linear infinite;
          display: inline-block;
        }
        @keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }

        @media (max-width: 800px) {
          .row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
