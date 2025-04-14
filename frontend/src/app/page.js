
import ToolTab from "@/component/ToolTab";

export default function Home() {
  const tools = [
    {
      header: "ABC Tool",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
      link: "/abc",


      isPremium: true,
    },
    {
      header: "ABC Tool",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
      link: "/abc",


      isPremium: true,
    },
    {
      header: "ABC Tool",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
      link: "/abc",


      isPremium: true,
    },
    {
      header: "ABC Tool",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
      link: "/abc",


      isPremium: false,
    },
    {
      header: "ABC Tool",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
      link: "/abc",


      isPremium: false,
    },
    {
      header: "ABC Tool",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
      link: "/abc",


      isPremium: false,
    },
    {
      header: "ABC Tool",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
      link: "/abc",


      isPremium: false,
    },
    {
      header: "ABC Tool",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
      link: "/abc",


      isPremium: false,
    },


  ];

  return (
    <div>
      <div className="font-bold mb-4  text-gray-500">
        Premium tools
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

        {tools
          .filter(tool => tool.isPremium)
          .map((tool, index) => (
            <ToolTab key={index} tool={tool} index={index} />
          ))}
      </div>

      <div className="font-bold mb-4 mt-10 text-gray-500">
        All the tools
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

        {tools
          .filter(tool => tool.isPremium === false)
          .map((tool, index) => (
            <ToolTab key={index} tool={tool} index={index} />
          ))}
      </div>
    </div>
  );
}
