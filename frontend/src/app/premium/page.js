export default function Premium() {
    return (
        <div>
            <div className="bg-white flex flex-col p-4 px-10 items-center w-120 rounded-lg shadow-lg"> 

                <div className="text-3xl font-medium text-yellow-400 ">
                    Premium
                </div>
                <div className="text-3xl font-medium text-yellow-400 ">
                    $69.96
                </div>
                <div className="border-b border-yellow-400 pb-5  w-full text-center mb-4">
                    Per month
                </div>

                <ul className=" list-disc flex flex-col gap-5">
                    <li>Access all the tools</li>
                    <li>Cancel any time</li>
                </ul>

                <button className="bg-yellow-400 cursor-pointer font-medium text-white p-4 rounded-md mt-4 hover:bg-blue-500 transition duration-300">
                    GET NOW
                </button>
            </div>
        </div>

    )
}