"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setVisible(true);
    setProgress(12);

    const step1 = window.setTimeout(() => setProgress(45), 80);
    const step2 = window.setTimeout(() => setProgress(72), 220);
    const step3 = window.setTimeout(() => setProgress(88), 420);
    const finish = window.setTimeout(() => {
      setProgress(100);
      window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 280);
    }, 620);

    return () => {
      window.clearTimeout(step1);
      window.clearTimeout(step2);
      window.clearTimeout(step3);
      window.clearTimeout(finish);
    };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 bg-neutral-200/80"
      aria-hidden="true"
    >
      <div
        className="navigation-progress-bar h-full bg-neutral-950 transition-[width] duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
