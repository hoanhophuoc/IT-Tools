'use client';
import './globals.css';
import Header from '@/component/Header';
import Sidebar from '@/component/Sidebar';
import { useState, useEffect } from 'react';

export default function RootLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };


    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <html lang="en" className="bg-gray-200">
      <body className="bg-gray-200 flex">
        <Sidebar isSidebarOpen={isSidebarOpen} tabs={tabs}/>

        <section
          className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'sm:w-[calc(100%-250px)]' : 'w-full'
            }`}
        >
          <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />


          <main className='m-4'>{children}</main>
        </section>
        {isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="fixed h-screen w-screen bg-gray-500  opacity-75 sm:hidden"
          >
          </button>
        )}
      </body>
    </html>
  );
}

const tabs = [
  {
    id: "tab1",
    name: "Tab1",
    links: [
      { tabName: "Name Link 1", link: "/abc" },
      { tabName: "Name Link 2", link: "/xyz" },
      { tabName: "Name Link 3", link: "/123" },
    ],
  },
  {
    id: "tab2",
    name: "Tab2",
    links: [
      { tabName: "Name Link 1", link: "/abc" },
      { tabName: "Name Link 2", link: "/xyz" },
      { tabName: "Name Link 3", link: "/123"},
    ],
  },
];