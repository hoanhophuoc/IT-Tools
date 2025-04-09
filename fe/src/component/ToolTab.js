import Link from "next/link";
import { LuHouse } from "react-icons/lu";
import { LiaStarSolid } from "react-icons/lia";

export default function ToolTab({ tool, index }) {
    return (
        <Link
            key={index}
            href={tool.link}
            className="flex flex-col bg-white h-36 justify-between w-auto p-4 rounded-md"
        >
            <LuHouse size={35} color="black" />
            <div className="flex flex-row gap-2">
                <div className="text-black">{tool.header}</div>
                <LiaStarSolid size={20} color={`${tool.isPremium ? '#f2b530' : 'gray'}`} />
            </div>

            <div className="text-gray-500 text-xs">{tool.description}</div>
        </Link>
    );
}