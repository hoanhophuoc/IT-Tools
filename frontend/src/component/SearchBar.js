export default function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="flex flex-grow items-center w-50 ">
      <input
        type="text"
        placeholder="Search tool name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border rounded-lg border-gray-400 px-4 py-2 w-full bg-gray-400 text-white"
      />
    </div>
  );
} 