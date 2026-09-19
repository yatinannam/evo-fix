"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useMotionTemplate, useMotionValue, motion } from "framer-motion";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const AcInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const radius = 100;
    const [visible, setVisible] = React.useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent<HTMLDivElement>) {
      const { left, top } = currentTarget.getBoundingClientRect();
      mouseX.set(clientX - left);
      mouseY.set(clientY - top);
    }

    return (
      <motion.div
        style={{
          background: useMotionTemplate`radial-gradient(${visible ? radius + "px" : "0px"} circle at ${mouseX}px ${mouseY}px, #D6F303, transparent 80%)`,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="group/input rounded-lg p-[2px] transition duration-300"
      >
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border-none bg-[#1a1a1a] px-3 py-2 text-sm text-white transition duration-400",
            "placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-[#D6F303]/60",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "shadow-[0px_0px_1px_1px_#2a2a2a] group-hover/input:shadow-none",
            className
          )}
          ref={ref}
          {...props}
        />
      </motion.div>
    );
  }
);
AcInput.displayName = "AcInput";

export { AcInput };
