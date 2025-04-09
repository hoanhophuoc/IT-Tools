import { IoIosArrowForward, IoIosArrowDown } from "react-icons/io";
import { useState } from "react";
import Link from "next/link";

export default function Sidebar({ isSidebarOpen,tabs }) {

    const [visibleTabs, setVisibleTabs] = useState({});

    const toggleTab = (tabId) => {
      setVisibleTabs((prev) => ({
        ...prev,
        [tabId]: !prev[tabId],
      }));
    };

    return (
        <aside
            className={`bg-white h-screen sm:sticky fixed top-0 transition-all duration-300 z-10 ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
                }`}
        >
            <div className="flex flex-col gap-2">
                {tabs.map((tab) => (
                    <div key={tab.id} className="pl-2 text-gray-500 ">

                        <button onClick={() => toggleTab(tab.id)}>
                            {visibleTabs[tab.id] ? (
                                <IoIosArrowDown size={16} className="inline mr-2" />
                            ) : (
                                <IoIosArrowForward size={16} className="inline mr-2" />
                            )}
                            {tab.name}
                        </button>

                        {visibleTabs[tab.id] && (
                            <ul className=" text-black text-md ml-2 w-full border-l-1 ">
                                {tab.links.map((item, index) => (
                                    <li key={index}>
                                        <Link href={item.link} className="ml-2 flex flex-row items-center gap-2 hover:bg-gray-200">
                                            {item.tabName}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </aside>
    );
}
