"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  icon?: string;
  iconPosition?: "left" | "right";
}

interface FaqAccordionProps {
  data: FaqItem[];
  className?: string;
  questionClassName?: string;
  answerClassName?: string;
  timestamp?: string;
}

export function FaqAccordion({
  data,
  className,
  questionClassName,
  answerClassName,
  timestamp,
}: FaqAccordionProps) {
  return (
    <Accordion.Root
      type="single"
      collapsible
      className={cn("w-full space-y-3", className)}
    >
      {data.map((item) => (
        <Accordion.Item key={item.id} value={String(item.id)}>
          <Accordion.Header>
            <Accordion.Trigger
              className={cn(
                "group flex w-full items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left transition-all duration-200",
                "bg-[#0D0D0D] hover:bg-[#141414] border border-white/5 hover:border-[rgba(214,243,3,0.2)]",
                "text-[#F0EDE5] font-semibold text-base",
                questionClassName
              )}
            >
              <span className="flex items-center gap-3">
                {item.icon && item.iconPosition === "left" && (
                  <span className="text-lg">{item.icon}</span>
                )}
                {item.question}
                {item.icon && item.iconPosition === "right" && (
                  <span className="text-lg">{item.icon}</span>
                )}
              </span>
              {/* Animated plus/minus */}
              <motion.span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 text-[#D6F303]"
                animate={{}}
              >
                <svg
                  className="transition-transform duration-300 group-data-[state=open]:rotate-45"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                >
                  <path
                    d="M7 1v12M1 7h12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.span>
            </Accordion.Trigger>
          </Accordion.Header>

          <Accordion.Content asChild forceMount>
            <AnswerPanel
              answer={item.answer}
              timestamp={timestamp}
              answerClassName={answerClassName}
            />
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

/* Animated answer panel — chat bubble style */
function AnswerPanel({
  answer,
  timestamp,
  answerClassName,
}: {
  answer: string;
  timestamp?: string;
  answerClassName?: string;
}) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{ overflow: "hidden" }}
    >
      <div
        className={cn(
          "mt-2 flex items-start gap-3 rounded-2xl px-5 py-4",
          "bg-[#0a0a0a] border border-white/5",
          answerClassName
        )}
      >
        {/* Bot avatar */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D6F303]/10 border border-[#D6F303]/20 mt-0.5">
          <Bot className="h-4 w-4 text-[#D6F303]" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm leading-relaxed text-[#F0EDE5]/80">{answer}</p>
          {timestamp && (
            <span className="text-xs text-white/30 mt-1">{timestamp}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
