"use client";

import React from "react";

type MenuItemProps = {
  className?: string;
  icon: React.ElementType;
  text: string;
  danger?: boolean;
  action?: () => void;
  endIcon?: React.ReactNode | null;
};

export function MenuItem({
  className,
  icon: Icon,
  text,
  danger,
  action,
  endIcon,
}: MenuItemProps) {
  return (
    <button
      onClick={action}
      className={`flex w-full items-center justify-between px-4 py-2 text-sm ${
        danger ? "text-red-600" : ""
      } ${className || ""}`}
    >
      {/* LEFT */}
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span>{text}</span>
      </div>

      {/* RIGHT */}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
}
