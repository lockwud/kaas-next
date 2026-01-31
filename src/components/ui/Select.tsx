import React from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
    error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = "", label, options, error, ...props }, ref) => {
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
                <div className="relative">
                    <select
                        ref={ref}
                        className={`flex h-11 w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 border-gray-200 ${className}`}
                        {...props}
                    >
                        <option value="" disabled selected>
                            Select {label}
                        </option>
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);

Select.displayName = "Select";
