"use client";

import type { Module } from "@/lib/types";
import { checkpointId } from "@/lib/course";
import { useProgressContext } from "@/context/ProgressContext";
import { AnimatedCheckbox } from "./AnimatedCheckbox";

interface CheckpointListProps {
  module: Module;
  onUpdate?: () => void;
}

export function CheckpointList({ module, onUpdate }: CheckpointListProps) {
  const { state, persist } = useProgressContext();

  const toggleCheckpoint = (index: number, checked: boolean) => {
    const id = checkpointId(module.id, index);
    const next = {
      ...state,
      checkpoints: { ...state.checkpoints, [id]: checked },
    };
    if (!checked) {
      next.modulesComplete = { ...next.modulesComplete, [module.id]: false };
    }
    persist(next);
    onUpdate?.();
  };

  const toggleModuleComplete = (checked: boolean) => {
    const next = {
      ...state,
      modulesComplete: { ...state.modulesComplete, [module.id]: checked },
      checkpoints: { ...state.checkpoints },
    };
    if (checked) {
      module.checkpoints.forEach((_, i) => {
        next.checkpoints[checkpointId(module.id, i)] = true;
      });
    }
    persist(next);
    onUpdate?.();
  };

  const allChecked =
    state.modulesComplete[module.id] ||
    module.checkpoints.every((_, i) =>
      state.checkpoints[checkpointId(module.id, i)]
    );

  const doneCount = module.checkpoints.filter((_, i) =>
    state.checkpoints[checkpointId(module.id, i)]
  ).length;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between border border-neutral-200 bg-neutral-50 px-4 py-3">
        <p className="text-sm text-neutral-600">
          Mark each item when you&apos;ve demonstrated mastery
        </p>
        <span className="font-mono text-xs font-semibold text-neutral-950">
          {doneCount}/{module.checkpoints.length}
        </span>
      </div>

      <ul className="space-y-2">
        {module.checkpoints.map((text, i) => {
          const id = checkpointId(module.id, i);
          const checked = !!state.checkpoints[id];
          return (
            <li key={id}>
              <div
                className={`flex cursor-pointer items-start gap-4 rounded-lg border px-4 py-4 transition-all ${
                  checked
                    ? "border-neutral-950 bg-neutral-50"
                    : "border-neutral-200 bg-white hover:border-neutral-950"
                }`}
                onClick={() => toggleCheckpoint(i, !checked)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") toggleCheckpoint(i, !checked);
                }}
                role="button"
                tabIndex={0}
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <AnimatedCheckbox
                    checked={checked}
                    onChange={(val) => toggleCheckpoint(i, val)}
                  />
                </div>
                <span
                  className={`pt-0.5 leading-relaxed transition-all ${
                    checked
                      ? "text-neutral-400 line-through"
                      : "text-neutral-700"
                  }`}
                >
                  {text}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <div
        role="button"
        tabIndex={0}
        onClick={() => toggleModuleComplete(!allChecked)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") toggleModuleComplete(!allChecked);
        }}
        className={`mt-6 flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg px-4 py-4 font-medium transition-all ${
          allChecked
            ? "bg-neutral-950 text-white"
            : "border-2 border-dashed border-neutral-300 text-neutral-600 hover:border-neutral-950 hover:text-neutral-950"
        }`}
      >
        <AnimatedCheckbox checked={allChecked} onChange={toggleModuleComplete} />
        <span>
          {allChecked ? "Module Complete" : "Mark entire module as complete"}
        </span>
      </div>
    </div>
  );
}
