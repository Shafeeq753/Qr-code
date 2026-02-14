
import React, { useRef, useEffect } from 'react';
// We use a canvas directly for maximum control over export formats
import QRCode from 'qrcode';

interface QRGeneratorProps {
  url: string;
  size?: number;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ url, size = 256, onCanvasReady }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: '#0f172a', // Slate 900
          light: '#ffffff'
        }
      }, (error) => {
        if (error) console.error('QR Error:', error);
        if (canvasRef.current) onCanvasReady(canvasRef.current);
      });
    }
  }, [url, size, onCanvasReady]);

  return (
    <div className="flex justify-center p-6 bg-white rounded-2xl shadow-inner">
      <canvas 
        ref={canvasRef} 
        className="max-w-full h-auto rounded-lg"
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export default QRGenerator;
