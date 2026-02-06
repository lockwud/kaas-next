import React from "react";

interface Column<T> {
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
    className?: string;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    actions?: (row: T) => React.ReactNode;
}

export function Table<T extends { id: string | number }>({ columns, data, actions }: TableProps<T>) {
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
                    {data.map((row) => (
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
                </tbody>
            </table>
        </div>
    );
}
