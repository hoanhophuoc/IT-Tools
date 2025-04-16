'use client';

import Table from "@/component/Table";
import PagingBar from "@/component/PagingBar";

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
            actions: {edit: 'put/tool/1', delete: 'delete/tool/1' },
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
    return (
        <div className="w-full">
            <Table columns={columns} data={apiData.data} />
            <PagingBar 
            total={apiData.total} 
            page={apiData.page}
            pageSize={apiData.pageSize}
            onPageChange={handlePageChange}
            />
        </div>
    );
}
