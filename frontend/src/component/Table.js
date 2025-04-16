'use client';
import { LiaStarSolid } from "react-icons/lia";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever, MdEditSquare } from "react-icons/md";


export default function Table({ data, columns }) {
    return (
        <div className="overflow-x-auto w-full">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                <thead>
                    <tr className="bg-gray-100 text-gray-700 text-sm font-semibold uppercase">
                        {columns.map((column) => (
                            <th key={column.key} className="px-4 py-2 text-left border-b border-gray-300">
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                    {data.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                            {columns.map((column) => (
                                <td key={column.key} className="px-4 py-2 border-b border-gray-300">
                                    {column.key === 'actions' ? (
                                        <div className="flex gap-2 items-center">
                                            <MdEditSquare className="cursor-pointer text-xl "
                                                onClick={() => alert(`call ${row.actions.edit}`)} />

                                            <MdDeleteForever className="cursor-pointer text-2xl"
                                                onClick={() => alert(`call ${row.actions.delete}`)} />
                                        </div>
                                    ) : column.key === 'icon' ? (
                                        <span className="text-xl">{row[column.key]}</span>
                                    ) : column.key === 'isPremium' ? (
                                        <LiaStarSolid className="text-2xl" color={`${row.isPremium ? '#f2b530' : 'gray'}`} />
                                    ) : (
                                        row[column.key]
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

    );
}
