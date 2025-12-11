'use client';

import { useRef, useState } from "react";
import clsx from "clsx";

export default function SpotlightCard({
  children,
  className = "",
  radius = 600,
  strength = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  radius?: number;
  strength?: number;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={clsx(
        "relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm",
        "transition duration-300",
        className
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(${radius}px circle at ${position.x}px ${position.y}px, rgba(59, 130, 246, ${strength}), transparent 40%)`,
        }}
      />
      <div className="relative h-full p-6">{children}</div>
    </div>
  );
}


