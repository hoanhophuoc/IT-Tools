'use client';

import { useState } from 'react';
import Table from "@/component/Table";
import PagingBar from "@/component/PagingBar";
import EditTool from "@/component/EditTool";

const columns = [
    { key: 'id', label: 'ID' },
    { key: 'toolName', label: 'Tool Name' },
    { key: 'toolDescription', label: 'Tool Description' },
    { key: 'icon', label: 'Icon' },
    { key: 'isPremium', label: 'Is Premium' },
    { key: 'actions', label: 'Actions' },
];


const handlePageChange = (pageNum) => {
    alert(`Page changed to${pageNum}`);
};

const apiData = {
    data: [
        {
            id: 1,
            toolName: 'Tool 1',
            toolDescription: 'Description for Tool 1',
            icon: '🔧',
            isPremium: false,
            actions: { edit: 'put/tool/1', delete: 'delete/tool/1' },
        },
        {
            id: 2,
            toolName: 'Tool 2',
            toolDescription: 'Description for Tool 2',
            icon: '🔨',
            isPremium: true,
            actions: { edit: 'put/tool/2', delete: 'delete/tool/2' },
        }
    ],
    total: 100,
    page: 10,
    pageSize: 2,
};

export default function ToolsPage() {
    const [isEditToolOpen, setIsEditToolOpen] = useState(false);

    const handleEditTool = (tool) => {
       alert(`Tool edited: ${tool}`);
    }

    return (
        <div className="w-full flex flex-col">
            <button className="self-end cursor-pointer bg-yellow-400 text-white px-4 py-2 rounded-lg my-2 hover:bg-blue-600 transition duration-200"
                onClick={() => setIsEditToolOpen(true)}>

                Add Tool
            </button>
            <Table columns={columns} data={apiData.data} />
            <PagingBar
                total={apiData.total}
                page={apiData.page}
                pageSize={apiData.pageSize}
                onPageChange={handlePageChange}
            />
            <div>

            </div>

            {
                isEditToolOpen && (
                    
                        <div className="absolute w-80 z-10 self-center">
                            <EditTool
                                toolName={'abc'}
                                toolDescription={'lol'}
                                icon={'icon1.png'}
                                isPremium={false}
                                onClose={() => setIsEditToolOpen(false)}
                                onSave={handleEditTool}
                            />
                        </div>

                )}
        </div>
    );
}
