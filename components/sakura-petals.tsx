"use client";

import { useState, useEffect } from "react";

interface Petal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  rotation: number;
}

interface PilePetal {
  id: number;
  left: number;
  bottom: number;
  size: number;
  opacity: number;
  rotation: number;
  zIndex: number;
}

export function SakuraPetals() {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [pilePetals, setPilePetals] = useState<PilePetal[]>([]);

  useEffect(() => {
    // Defer state updates to avoid cascading renders warning
    // Generate random values only on client side to avoid hydration mismatch
    const rafId = requestAnimationFrame(() => {
      setPetals(
        Array.from({ length: 35 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          delay: Math.random() * 10,
          duration: 8 + Math.random() * 7,
          size: 10 + Math.random() * 15,
          opacity: 0.5 + Math.random() * 0.4,
          rotation: Math.random() * 360,
        }))
      );

      setPilePetals(
        Array.from({ length: 60 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          bottom: Math.random() * 50 - 10,
          size: 12 + Math.random() * 18,
          opacity: 0.5 + Math.random() * 0.5,
          rotation: Math.random() * 360,
          zIndex: Math.floor(Math.random() * 3),
        }))
      );
    });

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <>
      {/* Falling petals */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {petals.map((petal) => (
          <div
            key={petal.id}
            className="absolute animate-fall"
            style={{
              left: `${petal.left}%`,
              top: "-5%",
              animationDelay: `${petal.delay}s`,
              animationDuration: `${petal.duration}s`,
            }}
          >
            <svg
              width={petal.size}
              height={petal.size}
              viewBox="0 0 24 24"
              style={{
                opacity: petal.opacity,
                transform: `rotate(${petal.rotation}deg)`,
              }}
            >
              <path
                d="M12 2C12 2 8 6 8 10C8 14 12 16 12 16C12 16 16 14 16 10C16 6 12 2 12 2Z"
                fill="oklch(0.82 0.12 350)"
              />
              <path
                d="M12 16C12 16 8 18 8 20C8 22 12 22 12 22C12 22 16 22 16 20C16 18 12 16 12 16Z"
                fill="oklch(0.88 0.1 350)"
                opacity="0.7"
              />
            </svg>
          </div>
        ))}
        <style jsx>{`
          @keyframes fall {
            0% {
              transform: translateY(0) translateX(0) rotate(0deg);
              opacity: 1;
            }
            25% {
              transform: translateY(25vh) translateX(20px) rotate(90deg);
            }
            50% {
              transform: translateY(50vh) translateX(-10px) rotate(180deg);
            }
            75% {
              transform: translateY(75vh) translateX(15px) rotate(270deg);
            }
            100% {
              transform: translateY(105vh) translateX(-5px) rotate(360deg);
              opacity: 0.3;
            }
          }
          .animate-fall {
            animation: fall linear infinite;
          }
        `}</style>
      </div>

      {/* Pile of petals at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 h-24 pointer-events-none z-20 overflow-hidden">
        {pilePetals.map((petal) => (
          <div
            key={petal.id}
            className="absolute"
            style={{
              left: `${petal.left}%`,
              bottom: `${petal.bottom}px`,
              zIndex: petal.zIndex,
            }}
          >
            <svg
              width={petal.size}
              height={petal.size}
              viewBox="0 0 24 24"
              style={{
                opacity: petal.opacity,
                transform: `rotate(${petal.rotation}deg)`,
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
              }}
            >
              <path
                d="M12 2C12 2 8 6 8 10C8 14 12 16 12 16C12 16 16 14 16 10C16 6 12 2 12 2Z"
                fill="oklch(0.82 0.12 350)"
              />
              <path
                d="M12 16C12 16 8 18 8 20C8 22 12 22 12 22C12 22 16 22 16 20C16 18 12 16 12 16Z"
                fill="oklch(0.88 0.1 350)"
                opacity="0.7"
              />
            </svg>
          </div>
        ))}
      </div>
    </>
  );
}
