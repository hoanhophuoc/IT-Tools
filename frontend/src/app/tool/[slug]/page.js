'use client';
import { notFound } from 'next/navigation';
import React, { useEffect, useState, use } from 'react';

export default function ToolPage({ params }) {

  const slug = use(params).slug;

  const toolMap = {
    abc: {
      name: 'Phép cộng đơn giản',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      htmlContent: `
        <div class="flex flex-col p-6 bg-gray-100 rounded-lg shadow-lg">
          <div class="mb-4">
            <input type="number" id="input1" placeholder="Input number" class="p-2  border border-gray-300 rounded" />
            <input type="number" id="input2" placeholder="Input number" class="p-2  border border-gray-300 rounded" />
          </div>
          <button class="p-2 w-1/2 bg-blue-500 text-white rounded hover:bg-blue-600" onclick="calculateSum()">Sum</button>
          <div class="mt-4">
            <span class="font-semibold">Result:</span>
            <span id="output" class="ml-2 text-lg font-semibold text-blue-500"></span>
          </div>
        </div>
      `,
      jsContent: `
        function calculateSum() {
          const input1 = parseFloat(document.getElementById('input1').value);
          const input2 = parseFloat(document.getElementById('input2').value);
          if (isNaN(input1) || isNaN(input2)) {
            document.getElementById('output').innerText = 'Invalid input!';
          } else {
            const sum = input1 + input2;
            document.getElementById('output').innerText = sum; 
          }
        }

      `,
    },
    xyz: {
      name: 'Tool này có tên XYZ',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      htmlContent: `<div class="text-center p-4 bg-gray-200">XYZ Tool content</div>`,
      jsContent: `console.log("Tool XYZ Loaded");`,
    },
  };

  const tool = toolMap[slug];

  if (!tool) {
    notFound();
  }

  const { name, description, htmlContent, jsContent } = tool;

  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = jsContent;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [jsContent]);

  return (
    <div className="p-4 flex flex-col items-center justify-center">
      <div>
        <div className="text-3xl font-semibold border-b-1 w-fit pr-5">{name}</div>
        <div className="text-gray-500 text-sm mb-4">{description}</div>

        <div className="">
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      </div>
    </div>
  );
}
