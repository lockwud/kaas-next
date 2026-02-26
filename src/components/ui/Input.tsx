import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", label, error, icon, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                        htmlFor={props.id}
                    >
                        {label}
                    </label>
                )}
                <div className="relative flex items-center">
                    {icon && (
                        <div className="absolute left-3 text-slate-400 pointer-events-none">
                            {React.cloneElement(icon as React.ReactElement, { size: 18 } as any)}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 border-gray-200 ${icon ? "pl-10" : ""} ${className}`}
                        {...props}
                    />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";
