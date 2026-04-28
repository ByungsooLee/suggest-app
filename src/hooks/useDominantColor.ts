"use client";

import { useEffect, useState } from "react";

export function useDominantColor(imageUrl: string | null | undefined): string | null {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 50;
      canvas.height = 50;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, 50, 50);
      const data = ctx.getImageData(0, 0, 50, 50).data;

      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness > 20 && brightness < 200) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
      }

      if (count === 0) return;
      r = Math.floor((r / count) * 0.3);
      g = Math.floor((g / count) * 0.3);
      b = Math.floor((b / count) * 0.3);
      setColor(`rgb(${r}, ${g}, ${b})`);
    };

    img.onerror = () => { /* ignore cross-origin failures */ };
  }, [imageUrl]);

  return color;
}
