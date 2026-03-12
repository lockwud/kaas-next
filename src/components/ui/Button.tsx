import React from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type MotionButtonProps = React.ComponentPropsWithoutRef<typeof motion.button>;

interface ButtonProps extends Omit<MotionButtonProps, "children"> {
    children: React.ReactNode;
    variant?: "primary" | "outline" | "ghost";
    isLoading?: boolean;
    loadingText?: string;
    blurOnLoading?: boolean;
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, className = "", variant = "primary", isLoading, loadingText, blurOnLoading = false, fullWidth, type, ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-11 px-8";

        const variants = {
            primary: "bg-green-600 hover:bg-green-700 text-white shadow-lg", // Green for School Theme, added shadow
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            ghost: "hover:bg-accent hover:text-accent-foreground",
        };

        const widthStyles = fullWidth ? "w-full" : "";

        const showOverlay = Boolean(isLoading && loadingText);
        const shouldBlur = Boolean(isLoading && (blurOnLoading || showOverlay));

        return (
            <motion.button
                ref={ref}
                type={type ?? "button"}
                className={`${baseStyles} ${variants[variant]} ${widthStyles} ${showOverlay ? "relative" : ""} ${className}`}
                disabled={isLoading || props.disabled}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                {...props}
            >
                {showOverlay ? (
                    <>
                        <span className={`inline-flex items-center gap-2 ${shouldBlur ? "blur-[1px] opacity-40" : ""}`}>
                            {children}
                        </span>
                        <span className="absolute inset-0 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {loadingText}
                        </span>
                    </>
                ) : (
                    <>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <span className={shouldBlur ? "blur-[1px] opacity-40" : ""}>{children}</span>
                    </>
                )}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
