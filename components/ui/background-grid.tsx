export default function BackgroundGrid() {
  return (
    <div className="fixed inset-0 z-[-1] h-full w-full bg-zinc-950">
      {/* 1. The Grid Pattern */}
      <div className="absolute h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* 2. The Radial Gradient (Spotlight Effect) */}
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-500 opacity-20 blur-[100px]" />

      {/* 3. The Bottom Fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
    </div>
  );
}


