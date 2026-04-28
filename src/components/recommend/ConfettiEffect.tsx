"use client";

export async function triggerMoviePicked() {
  const confetti = (await import("canvas-confetti")).default;

  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#E8C97A", "#e8e3d8", "#7F77DD", "#1D9E75"],
    shapes: ["square", "circle"],
    scalar: 0.9,
  });

  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 50,
      origin: { x: 0, y: 0.6 },
      colors: ["#E8C97A", "#e8e3d8"],
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 50,
      origin: { x: 1, y: 0.6 },
      colors: ["#E8C97A", "#e8e3d8"],
    });
  }, 200);
}
