"use client";

export function UnlimitedBadge() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-lg leading-none text-primary">∞</span>
      <div className="flex flex-col leading-none gap-0.5">
        <span className="text-[11px] font-extrabold tracking-[2px] uppercase text-primary">
          Free
        </span>
      </div>
    </div>
  );
}
