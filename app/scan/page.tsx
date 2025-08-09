'use client';
import { useEffect, useRef, useState } from 'react';

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [result, setResult] = useState<string>('');
  const [supported, setSupported] = useState<boolean>(true);

  useEffect(() => {
    let stream: MediaStream | undefined;

    (async () => {
      // Check support
      // @ts-ignore
      const Supported = typeof window !== 'undefined' && !!window.BarcodeDetector;
      setSupported(Supported);
      if (!Supported) return;

      // Camera (secure context required: HTTPS or localhost)
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // @ts-ignore
      const detector = new window.BarcodeDetector({ formats: ['qr_code', 'code_128', 'ean_13'] });

      const tick = async () => {
        if (!videoRef.current) return;
        const w = videoRef.current.videoWidth || 640;
        const h = videoRef.current.videoHeight || 480;
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(videoRef.current, 0, 0, w, h);
        try {
          const codes = await detector.detect(canvas);
          if (codes.length) setResult(codes[0].rawValue || '');
        } catch {}
        requestAnimationFrame(tick);
      };
      tick();
    })().catch(console.error);

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold mb-3">Scan</h1>
      {!supported && (
        <p className="mb-3 text-sm">
          This device doesn’t support the Barcode Detector API. Use HTTPS and a modern Chrome/Android,
          or we can add a ZXing-based fallback.
        </p>
      )}
      <video ref={videoRef} className="w-full rounded bg-black" muted playsInline />
      <p className="mt-3">Result: <strong>{result || '—'}</strong></p>
    </main>
  );
}
