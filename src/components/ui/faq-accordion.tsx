"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export interface FaqAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  items?: FaqItem[];
  title?: string;
}

export function FaqAccordion({
  items = [],
  title,
  className,
  ...props
}: FaqAccordionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className={cn("w-full mx-auto py-8 relative font-sans", className)} {...props}>
      {title && (
        <h2 className="text-center font-bold text-2xl md:text-3xl mb-10 text-neutral-400">
          {title}
        </h2>
      )}

      <ul className="w-full mx-auto list-none p-0 flex flex-col">
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <li
              key={index}
              className={cn(
                "w-full relative transition-all duration-300 ease-in",
                "border-b-2 border-neutral-800",
                "last:border-b-0",
                isActive ? "border-b border-neutral-700" : ""
              )}
            >
              <button
                className={cn(
                  "flex flex-row items-center justify-start w-full min-h-[60px] py-4 relative m-0 px-5 cursor-pointer",
                  "border-l-[6px] md:border-l-[10px] transition-colors duration-200 text-left outline-none text-base md:text-lg",
                  isActive
                    ? "border-l-[#D6F303] bg-[#D6F303]/5 text-[#F0EDE5] font-semibold"
                    : "border-l-neutral-700 bg-transparent text-neutral-400 hover:border-l-neutral-500 hover:text-neutral-200 hover:bg-neutral-900/50"
                )}
                onClick={() => toggleItem(index)}
                aria-expanded={isActive}
              >
                <span className="pr-10">{item.question}</span>

                {/* Chevron */}
                <span
                  className={cn(
                    "absolute right-6 block w-2.5 h-2.5 border-t-[2.5px] border-r-[2.5px] transition-transform duration-200 ease-in-out",
                    isActive
                      ? "rotate-[-44deg] border-[#D6F303]"
                      : "rotate-[133deg] border-neutral-500"
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out w-full",
                  "border-l-[6px] md:border-l-[10px]",
                  isActive
                    ? "grid-rows-[1fr] border-l-[#D6F303] bg-[#D6F303]/5"
                    : "grid-rows-[0fr] border-l-neutral-700 bg-transparent"
                )}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-row items-start justify-start w-full px-5 pb-6 pt-2 text-base md:text-lg font-normal text-neutral-300">
                    <span className="opacity-90">{item.answer}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default FaqAccordion;
