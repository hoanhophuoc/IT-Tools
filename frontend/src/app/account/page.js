export default function Account() {
    return (
        <div>
            <div className="bg-white p-4 px-10 rounded-lg shadow-lg">
                <div className="text-3xl font-semibold text-black border-b w-fit pr-10 border-b-black pb-2 ">Account</div>
                <section className="flex sm:flex-row flex-col gap-10   justify-between ">
                    <section className="flex flex-col gap-2 text-gray-500">
                        <div className="flex flex-col">
                            <label className="text-lg font-medium">Full name</label>
                            <input type="text" className="border border-gray-300 bg-gray-300 rounded-lg p-2 w-full mt-2" placeholder="Full name" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-lg font-medium">Email</label>
                            <input type="email" className="border border-gray-300 bg-gray-300 rounded-lg p-2 w-full mt-2" placeholder="examble@gmail.com" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-lg font-medium">Phone number</label>
                            <input type="number" className="border border-gray-300 bg-gray-300 rounded-lg p-2 w-full mt-2" placeholder="+84 *** *** ***" />
                        </div>

                        <button className="bg-yellow-400 cursor-pointer text-white font-medium p-2 rounded-lg mt-2 w-2/3  hover:bg-blue-500 transition duration-300">
                            Change
                        </button>
                    </section>

                    <section className="flex flex-col gap-2 text-gray-500">
                        <div className="flex flex-col">
                            <label className="text-lg font-medium">Old password</label>
                            <input type="password" className="border border-gray-300 bg-gray-300 rounded-lg p-2 w-full mt-2" placeholder="******" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-lg font-medium">New password</label>
                            <input type="password" className="border border-gray-300 bg-gray-300 rounded-lg p-2 w-full mt-2" placeholder="******" />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-lg font-medium">Confirm password</label>
                            <input type="password" className="border border-gray-300 bg-gray-300 rounded-lg p-2 w-full mt-2" placeholder="******" />
                        </div>

                        <button className="bg-yellow-400 cursor-pointer text-white font-medium p-2 rounded-lg mt-2 w-2/3  hover:bg-blue-500 transition duration-300">
                            Change
                        </button>
                    </section>
                </section>
            </div>
        </div>
    )
}