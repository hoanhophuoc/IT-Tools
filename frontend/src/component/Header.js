import { FiAlignJustify, FiHome } from "react-icons/fi";
import { LiaStarSolid } from "react-icons/lia";
import { RxAvatar } from "react-icons/rx";

import SearchBar from "./SearchBar";

export default function Header({isSidebarOpen, setIsSidebarOpen}) {
    return (
        <header className=" mx-4 flex flex-row items-center gap-6 h-24">
            <div>
                <FiAlignJustify size={30} color="black" onClick={()=>setIsSidebarOpen(!isSidebarOpen)} className="cursor-pointer"/>
            </div>
            <a href="/"><FiHome size={30} color="black" /> </a>

            <SearchBar />
            <a href="/premium"><LiaStarSolid size={30} color="black" /> </a>
            <a href="/account"><RxAvatar size={30} color="black" /> </a>

        </header>
    )
}