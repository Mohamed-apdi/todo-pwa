'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [supported, setSupported] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let stream: MediaStream | undefined;

    (async () => {
      const hasDetector = typeof window !== 'undefined' && !!window.BarcodeDetector;
      setSupported(hasDetector);
      if (!hasDetector) return;

      // Camera (secure context: HTTPS or localhost)
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }

      const detector = new window.BarcodeDetector!({ formats: ['qr_code'] });

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
          if (codes.length) {
            const value = codes[0].rawValue;

            // stop camera
            stream?.getTracks().forEach(t => t.stop());

            // redirect
            if (value.startsWith('http')) {
              window.location.href = value;      // external URL
            } else {
              router.push(`/${value}`);          // internal route
            }
            return;
          }
        } catch {}
        requestAnimationFrame(tick);
      };
      tick();
    })().catch(console.error);

    return () => stream?.getTracks().forEach(t => t.stop());
  }, [router]);

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold mb-3">Scan QR Code</h1>
      {!supported && (
        <p className="mb-3 text-sm text-red-600">
          This device doesn’t support the Barcode Detector API. Use HTTPS/localhost or add a ZXing fallback.
        </p>
      )}
      <video ref={videoRef} className="w-full rounded bg-black" muted playsInline />
      <p className="mt-3 text-sm text-gray-600">Point camera at a QR code.</p>
    </main>
  );
}
