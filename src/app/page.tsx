
"use client";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight">Project Reset</h1>
        <p className="text-muted-foreground text-lg text-center">
          Starting from zero. What would you like to build today?
        </p>
        <div className="mt-8 p-4 border rounded-lg bg-card border-border">
          <p className="text-sm">
            Powered By Hassan Deeb - Deeb Data
          </p>
        </div>
      </div>
    </div>
  );
}
