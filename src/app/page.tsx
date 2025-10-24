"use client";

import { useMemo, useState } from 'react';

type TransformResponse = {
  count: number;
  prompts: string[];
  transformed: string[];
};

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [intensity, setIntensity] = useState<number>(0.75);
  const [tone, setTone] = useState<string>('heroic');
  const [seed, setSeed] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<TransformResponse | null>(null);
  const [error, setError] = useState<string>('');

  const disabled = useMemo(() => busy || !file, [busy, file]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true); setError(''); setResult(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const params = new URLSearchParams();
      params.set('intensity', String(intensity));
      if (tone) params.set('tone', tone);
      if (seed) params.set('seed', seed);

      const res = await fetch(`/api/transform?${params.toString()}`, { method: 'POST', body: form });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json() as TransformResponse;
      setResult(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const doExport = async (format: 'txt' | 'csv' | 'pdf') => {
    if (!result) return;
    const res = await fetch('/api/export', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ transformed: result.transformed, format }) });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `transformed.${format}`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <div className="header">
        <div className="h1">1980s Animation DNA Adapter</div>
        <span className="badge">Next.js</span>
        <span className="badge">PDF → Prompts</span>
        <span className="badge">Neon Synthwave</span>
      </div>
      <p className="sub">Upload your image prompt PDF. We will randomly adapt each prompt into a curated 1980s animation DNA with cel-shaded tropes and neon palettes.</p>

      <form className="panel" onSubmit={onSubmit}>
        <div className="row">
          <input className="input" type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] ?? null)} />
          <label>
            <div className="sub">Intensity ({Math.round(intensity*100)}%)</div>
            <input className="input" type="range" min={0} max={1} step={0.01} value={intensity} onChange={e => setIntensity(parseFloat(e.target.value))} />
          </label>
          <label>
            <div className="sub">Tone</div>
            <select className="input" value={tone} onChange={e => setTone(e.target.value)}>
              <option value="heroic">heroic</option>
              <option value="satirical">satirical</option>
              <option value="mystery">mystery</option>
              <option value="sci-fi">sci-fi</option>
              <option value="fantasy">fantasy</option>
              <option value="action">action</option>
            </select>
          </label>
          <label>
            <div className="sub">Seed (optional)</div>
            <input className="input" placeholder="repeatable randomness" value={seed} onChange={e => setSeed(e.target.value)} />
          </label>
          <button className="button" disabled={disabled}>{busy ? 'Transforming…' : 'Transform PDF'}</button>
        </div>
      </form>

      {error && <div className="card">Error: {error}</div>}

      {result && (
        <div className="panel">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="h1">Transformed ({result.count})</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="button" onClick={() => doExport('txt')}>Export TXT</button>
              <button className="button" onClick={() => doExport('csv')}>Export CSV</button>
              <button className="button" onClick={() => doExport('pdf')}>Export PDF</button>
            </div>
          </div>
          <hr />
          <div className="list">
            {result.transformed.map((t, i) => (
              <div key={i} className="card">
                <div className="sub">Prompt {i+1}</div>
                <div className="code">{t}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ height: 48 }} />
      <footer className="sub">Made with neon dreams. © 198X</footer>
    </div>
  );
}
