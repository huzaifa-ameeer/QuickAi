import { useState } from "react";
import { Edit, Sparkle } from "lucide-react";
import { useApi, isUpgradeError } from "../config/api";
import ResultPanel from "../components/ResultPanel";
import UpgradePrompt from "../components/UpgradePrompt";

const WriteArticle = () => {
  const articleLength = [
    { length: 800, text: "Short (500-800 words)" },
    { length: 1200, text: "Medium (800-1200 words)" },
    { length: 1600, text: "Long (1200+ words)" },
  ];

  const { request } = useApi();

  const [selectedLength, setSelectedLength] = useState(articleLength[0]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");
    try {
      const data = await request("/ai/generate-article", {
        method: "POST",
        body: {
          prompt: `Write an article about ${input} in ${selectedLength.text}.`,
          length: selectedLength.length,
        },
      });
      setResult(data.content);
    } catch (err) {
      setError(err.message);
      if (isUpgradeError(err.message)) setUpgradeOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700">
      {/* left col */}
      <form
        onSubmit={onSubmitHandler}
        className="w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Sparkle className="w-10 p-2.5 h-10 rounded-lg text-white bg-black" />
          <h1 className="text-xl font-semibold">Article Configuration</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Article Topics</p>
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="The future of artificial intelligence is..."
          required
        />
        <p className="mt-4 text-sm font-medium">Article Length</p>
        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {articleLength.map((item, index) => (
            <span
              onClick={() => setSelectedLength(item)}
              className={`text-xs px-4 py-1 bg-[#EFF6FF] border cursor-pointer rounded-full ${selectedLength.text === item.text ? "bg-blue-50 text-blue-700" : "border-gray-300 text-gray-500"}`}
              key={index}
            >
              {item.text}
            </span>
          ))}
        </div>
        <br />
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-linear-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-60"
        >
          <Edit className="w-5" />
          {loading ? "Generating..." : "Generate Article"}
        </button>
      </form>

      {/* right col */}
      <ResultPanel
        icon={Edit}
        title="Generated Article"
        loading={loading}
        error={error}
        result={result}
      />

      <UpgradePrompt
        open={upgradeOpen}
        message={error}
        onClose={() => setUpgradeOpen(false)}
      />
    </div>
  );
};

export default WriteArticle;
