 "use client";

import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, Video, Trophy, ArrowRight } from "lucide-react";
import BackgroundGrid from "@/components/ui/background-grid";
import SpotlightCard from "@/components/ui/spotlight-card";

// Lightweight tilt card for micro-interactions
function TiltCard({
  children,
  max = 10,
  scale = 1.02,
  className = "",
}: {
  children: React.ReactNode;
  max?: number;
  scale?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -max;
    const rotateY = ((x - centerX) / centerX) * max;
    el.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{
        transition: "transform 0.25s ease",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

function TiltTitle({
  children,
  max = 6,
  scale = 1.01,
  className = "",
}: {
  children: React.ReactNode;
  max?: number;
  scale?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -max;
    const rotateY = ((x - centerX) / centerX) * max;
    el.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translateZ(10px)`;
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) scale(1) translateZ(0)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{
        transition: "transform 0.35s ease",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-background/80 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.18),_transparent_45%)] p-8">
      <BackgroundGrid />
      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-16 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>
      <div className="z-10 w-full max-w-5xl text-center space-y-10">
        <div className="space-y-4 flex flex-col items-center">
          <TiltCard className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 shadow-sm shadow-primary/10 w-fit">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Powered by Groq (Llama 3.3)</span>
          </TiltCard>

          <TiltTitle className="inline-block animate-float-soft hero-glow" max={10} scale={1.05}>
            <h1 className="relative text-6xl font-bold tracking-tighter drop-shadow-[0_8px_25px_rgba(0,0,0,0.35)]">
              <span className="text-shine relative inline-block hover-glow">
                Synta
                <span className="absolute inset-0 blur-2xl opacity-40 bg-gradient-to-r from-blue-500/40 via-purple-400/40 to-white/30 -z-10" />
              </span>
            </h1>
          </TiltTitle>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn programming with AI-powered interactive chat, curated videos, and intelligent quizzes
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <TiltCard>
          <Link href="/signin">
              <Button
                size="lg"
                className="active:scale-95 transition-transform bg-white hover:bg-white text-black hover:text-black shadow-lg shadow-blue-600/30 gap-2 btn-metallic"
              >
              Get Started
                <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          </TiltCard>
          <TiltCard>
          <Link href="/signin">
            <Button size="lg" variant="outline" className="active:scale-95 transition-transform">
              Sign In
            </Button>
          </Link>
          </TiltCard>
        </div>

        {/* Highlight badges */}
        <div className="grid gap-4 md:grid-cols-3 mt-8">
          {[
            { label: "12 languages", desc: "Python, JS, TS, Java, Go, Rust and more" },
            { label: "Live streaming", desc: "Chat, code, quiz—no page reloads" },
            { label: "Personalized picks", desc: "Videos and quizzes by topic" },
          ].map((item) => (
            <SpotlightCard
              key={item.label}
              radius={350}
              strength={0.12}
              className="rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-4 text-left backdrop-blur-sm shadow-lg shadow-black/25"
            >
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </SpotlightCard>
          ))}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            {
              icon: Brain,
              title: "AI Chat Tutor",
              desc: "Get instant help that explains concepts, debugs code, and remembers context.",
            },
            {
              icon: Video,
              title: "Curated Videos",
              desc: "Watch targeted tutorials recommended by AI for your current topic.",
            },
            {
              icon: Trophy,
              title: "Smart Quizzes",
              desc: "Test yourself with AI-generated quizzes tailored to your progress.",
            },
          ].map((feature) => (
            <SpotlightCard
              key={feature.title}
              className="group relative overflow-hidden rounded-xl"
            >
              <feature.icon className="h-10 w-10 mb-4 text-primary transition-transform duration-300 group-hover:scale-110" />
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </main>
  );
}

<style jsx global>{`
  .text-shine {
    background: linear-gradient(90deg, #ffffff, #b8c7ff, #ffffff);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    color: transparent;
    animation: shine 6s linear infinite;
    filter: drop-shadow(0 10px 25px rgba(79, 70, 229, 0.15));
  }
  .hover-glow {
    position: relative;
  }
  .hover-glow:hover {
    transform: scale(1.02);
    transition: transform 0.25s ease;
  }
  .hero-glow {
    position: relative;
  }
  .hero-glow::before {
    content: "";
    position: absolute;
    inset: -80px;
    z-index: -1;
    background: radial-gradient(circle at 50% 40%, rgba(59, 130, 246, 0.25), transparent 55%);
    filter: blur(40px);
    opacity: 0.9;
    transition: opacity 0.4s ease;
  }
  .hero-glow:hover::before {
    opacity: 1;
  }
  .hover-glow::after {
    content: "";
    position: absolute;
    inset: -8px;
    border-radius: 9999px;
    background: radial-gradient(circle at 50% 50%, rgba(124, 58, 237, 0.25), transparent 60%);
    opacity: 0;
    transition: opacity 0.35s ease;
    pointer-events: none;
    filter: blur(10px);
  }
  .hover-glow:hover::after {
    opacity: 1;
  }
  .animate-float-soft {
    animation: floatSoft 6s ease-in-out infinite;
  }
  @keyframes shine {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  @keyframes floatSoft {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-6px);
    }
  }
  /* Custom cursor (simple dot) */
  :root {
    --cursor-url: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 18 18'%3E%3Ccircle cx='9' cy='9' r='4' fill='%23ffffff' fill-opacity='0.8'/%3E%3C/svg%3E");
  }
  body {
    cursor: var(--cursor-url), auto;
  }
  a,
  button {
    cursor: var(--cursor-url), pointer;
  }

  /* Metallic hover effect for primary CTA */
  .btn-metallic {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    color: black;
  }
  .btn-metallic::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      120deg,
      rgba(255, 255, 255, 0) 20%,
      rgba(255, 255, 255, 0.4) 40%,
      rgba(255, 255, 255, 0) 60%
    );
    transform: translateX(-100%);
    transition: transform 0.6s ease;
    pointer-events: none;
    mix-blend-mode: screen;
    opacity: 0.7;
  }
  .btn-metallic:hover::before {
    transform: translateX(100%);
  }
  .btn-metallic:hover {
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.25);
    color: black;
  }
`}</style>

