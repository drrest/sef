import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface GlassCardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
    hoverEffect?: boolean;
}

export function GlassCard({
    children,
    className,
    contentClassName,
    hoverEffect = false,
    ...props
}: GlassCardProps) {
    return (
        <motion.div
            className={cn(
                "relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md shadow-xl",
                hoverEffect && "transition-all duration-300 hover:bg-black/30 hover:shadow-2xl hover:border-white/20 hover:scale-[1.01]",
                className
            )}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            {...props}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className={cn("relative z-10 p-6", contentClassName)}>
                {children}
            </div>
        </motion.div>
    );
}
