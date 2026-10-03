"use client";
import { useState } from "react";
import CopyToClipboardButton from "@/components/ui/CopyToClipboardButton";
import Button from "@/components/ui/Button";

function getRandomPort() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return 1024 + (array[0] % (65535 - 1024 + 1));
}

export default function RandomPortGenerator() {
  const [port, setPort] = useState(getRandomPort);

  const handleRefresh = () => {
    setPort(getRandomPort());
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-6">
        <span className="rounded border border-gray-300 bg-gray-100 px-4 py-2 font-mono text-lg dark:border-gray-700 dark:bg-gray-800">
          {port}
        </span>
        <div className="flex gap-5">
          <CopyToClipboardButton textToCopy={String(port)} buttonText="Copy" />
          <Button
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
