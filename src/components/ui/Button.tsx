import React from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: "primary" | "outline" | "ghost";
    isLoading?: boolean;
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, className = "", variant = "primary", isLoading, fullWidth, ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-11 px-8";

        const variants = {
            primary: "bg-green-600 hover:bg-green-700 text-white shadow-lg", // Green for School Theme, added shadow
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            ghost: "hover:bg-accent hover:text-accent-foreground",
        };

        const widthStyles = fullWidth ? "w-full" : "";

        return (
            <motion.button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${widthStyles} ${className}`}
                disabled={isLoading || props.disabled}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
