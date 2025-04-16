'use client';
import { useState } from 'react';
import Image from 'next/image';
import { IoIosArrowDown } from 'react-icons/io';

const iconList = ['icon1.png', 'icon2.png', 'icon3.png']; 

export default function EditTool({ toolName, toolDescription, icon, isPremium }) {
    const [selectedIcon, setSelectedIcon] = useState(icon);
    const [showIcons, setShowIcons] = useState(false);
    const [premium, setPremium] = useState(isPremium);

    return (
        <div>
            <div className="bg-white p-4 px-10 rounded-lg shadow-lg">
                <div className="text-3xl font-semibold text-black border-b w-fit pr-10 border-b-black pb-2">
                    Edit tool
                </div>

                <section className="flex sm:flex-row flex-col gap-10 justify-between">
                    <section className="flex flex-col gap-4 text-gray-500 w-full">
                        <div className="flex flex-col">
                            <label className="text-lg font-medium">Tool name</label>
                            <input
                                type="text"
                                className="border border-gray-300 bg-gray-300 rounded-lg p-2 w-full mt-2"
                                placeholder={toolName}
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-lg font-medium">Tool description</label>
                            <input
                                type="text"
                                className="border border-gray-300 bg-gray-300 rounded-lg p-2 w-full mt-2"
                                placeholder={toolDescription}
                            />
                        </div>

                        <div className="flex flex-col relative">
                            <label className="text-lg font-medium">Select Icon</label>
                            <div
                                className="flex items-center gap-2 border p-2 rounded-lg bg-gray-100 cursor-pointer w-fit"
                                onClick={() => setShowIcons((prev) => !prev)}
                            >
                                <Image
                                    src={`/images/icons/${selectedIcon}`}
                                    alt="selected icon"
                                    width={40}
                                    height={40}
                                />
                                <IoIosArrowDown className="text-xl text-gray-600" />
                            </div>

                            {showIcons && (
                                <div className="flex  gap-4 mt-3 border p-3 rounded-md flex-col w-fit  -bottom-55 h-50 absolute overflow-y-auto bg-gray-50">
                                    {iconList.map((iconFile) => (
                                        <div
                                            key={iconFile}
                                            className={`border-2 p-1 rounded cursor-pointer ${
                                                selectedIcon === iconFile
                                                    ? 'border-blue-500'
                                                    : 'border-transparent'
                                            }`}
                                            onClick={() => {
                                                setSelectedIcon(iconFile);
                                                setShowIcons(false);
                                            }}
                                        >
                                            <Image
                                                src={`/images/icons/${iconFile}`}
                                                alt={iconFile}
                                                width={40}
                                                height={40}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <label className="text-lg font-medium">Premium</label>
                            <button
                                className={`mt-2 w-32 px-4 py-2 rounded-lg font-medium transition ${
                                    premium ? 'bg-yellow-400 text-white' : 'bg-gray-300 text-black'
                                }`}
                                onClick={() => setPremium((prev) => !prev)}
                            >
                                {premium ? 'Premium ✅' : 'Free ❌'}
                            </button>
                        </div>

                        <button className="bg-yellow-400 cursor-pointer text-white font-medium p-2 rounded-lg mt-4 w-2/3 hover:bg-blue-500 transition duration-300">
                            Change
                        </button>
                    </section>
                </section>
            </div>
        </div>
    );
}
