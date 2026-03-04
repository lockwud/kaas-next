import React from "react";
import { FileX2 } from "lucide-react";

interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    actions?: (row: T) => React.ReactNode;
    loading?: boolean;
    skeletonRows?: number;
    emptyTitle?: string;
    emptyDescription?: string;
}

export function Table<T extends { id: string | number }>({
    columns,
    data,
    actions,
    loading = false,
    skeletonRows = 5,
    emptyTitle = "No data found",
    emptyDescription = "There are no results to display at this time",
}: TableProps<T>) {
    const totalColumns = columns.length + (actions ? 1 : 0);

    return (
        <div className="w-full overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className={`p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.className || ""}`}
                            >
                                {col.header}
                            </th>
                        ))}
                        {actions && <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading &&
                        Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                            <tr key={`skeleton-${rowIndex}`} className="animate-pulse">
                                {columns.map((col, index) => (
                                    <td key={`${rowIndex}-${index}`} className="p-4">
                                        <div className="h-4 w-full max-w-[180px] rounded bg-slate-200" />
                                    </td>
                                ))}
                                {actions && (
                                    <td className="p-4 text-right">
                                        <div className="ml-auto h-8 w-20 rounded bg-slate-200" />
                                    </td>
                                )}
                            </tr>
                        ))}

                    {!loading && data.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                            {columns.map((col, index) => (
                                <td key={index} className="p-4 text-sm text-gray-700">
                                    {typeof col.accessor === "function"
                                        ? col.accessor(row)
                                        : (row[col.accessor] as React.ReactNode)}
                                </td>
                            ))}
                            {actions && (
                                <td className="p-4 text-right">
                                    {actions(row)}
                                </td>
                            )}
                        </tr>
                    ))}

                    {!loading && data.length === 0 && (
                        <tr>
                            <td colSpan={totalColumns} className="h-[340px] px-4 py-8">
                                <div className="flex h-full flex-col items-center justify-center text-center">
                                    <div className="mb-3 rounded-2xl bg-slate-100 p-3 text-slate-400">
                                        <FileX2 size={24} />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700">{emptyTitle}</p>
                                    <p className="mt-1 text-xs text-slate-400">{emptyDescription}</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
