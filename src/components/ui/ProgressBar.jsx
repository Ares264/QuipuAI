import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

export function ProgressBar({ value = 0, max = 100, className, indicatorClassName }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <motion.div
        className={cn("h-full bg-primary transition-all duration-500 ease-in-out", indicatorClassName)}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  );
}
