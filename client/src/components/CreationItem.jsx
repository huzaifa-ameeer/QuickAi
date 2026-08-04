import { useState } from "react";
import Markdown from "react-markdown";
import { Trash2 } from "lucide-react";

const CreationItem = ({ item, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(item.id);
  };

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      className="p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer"
    >
      <div className="flex justify-between items-center gap-4">
        <div>
          <h2>{item.prompt}</h2>
          <p className="text-gray-500">
            {item.type} - {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full">
            {item.type}
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              title="Delete creation"
              className="p-2 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 cursor-pointer"
            >
              <Trash2 className="w-4" />
            </button>
          )}
        </div>
      </div>
      {expanded && (
        <div>
          {item.type === "image" ||
          item.type === "remove-background" ||
          item.type === "remove-object" ? (
            <div>
              <img src={item.content} alt="" className="mt-3 w-full max-w-md" />
            </div>
          ) : (
            <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-700">
              <div className="reset-tw">
                <Markdown>{item.content}</Markdown>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CreationItem;
