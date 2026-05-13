import React from "react";

export const ToggleSwitch = ({ checked, onCheckedChange }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative w-[52px] h-[30px] rounded-full transition-all duration-300 ease-in-out cursor-pointer hover:brightness-110 active:scale-95 border-none outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 ${
        checked
          ? "bg-gradient-to-r from-[#10B981] to-[#34D399] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),_0_0_15px_rgba(16,185,129,0.3)]"
          : "bg-slate-200 dark:bg-slate-600 shadow-inner"
      }`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full transition-all duration-300 ease-out shadow-[0_2px_5px_rgba(0,0,0,0.2)] flex items-center justify-center ${
          checked ? "left-[26px]" : "left-[3px]"
        }`}
      >
        <div className={`w-full h-full rounded-full bg-gradient-to-b from-white to-slate-50 opacity-90`} />
      </span>
    </button>
  );
};
