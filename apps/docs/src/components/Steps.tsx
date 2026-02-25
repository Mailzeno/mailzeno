import React from "react";

interface StepsProps {
    children: React.ReactNode;
}

interface StepProps {
    number: string;
    title: string;
    children: React.ReactNode;
}

export function Steps({ children }: StepsProps) {
    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 my-6">
            {children}
        </div>
    );
}

export function Step({ number, title, children }: StepProps) {
    return (
        <div className="p-5 rounded-[10px] border border-border-primary bg-bg-secondary">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center font-bold text-xs text-white mb-3">
                {number}
            </div>
            <div className="font-semibold text-sm text-text-heading mb-1.5">
                {title}
            </div>
            <div className="text-[0.8125rem] text-text-tertiary leading-relaxed">
                {children}
            </div>
        </div>
    );
}
