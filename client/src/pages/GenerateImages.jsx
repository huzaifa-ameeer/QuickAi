import { Image, Sparkles } from "lucide-react";
import { useState } from "react";
import { useApi, isUpgradeError } from "../config/api";
import ResultPanel from "../components/ResultPanel";
import UpgradePrompt from "../components/UpgradePrompt";

const GenerateImages = () => {
  const imageStyle = [
    "Realistic",
    "Ghibli style",
    "Anime style",
    "Cartoon style",
    "Fantasy style",
    "3D style",
    "Potrait style",
  ];

  const { request } = useApi();

  const [selectedStyle, setSelectedStyle] = useState("Realistic");
  const [input, setInput] = useState("");
  const [publish, setPublish] = useState(false);
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
      const data = await request("/ai/generate-image", {
        method: "POST",
        body: {
          prompt: `Generate an image of ${input} in the style ${selectedStyle}.`,
          publish,
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
          <Sparkles className="w-10 p-2.5 h-10 rounded-lg text-white bg-black" />
          <h1 className="text-xl font-semibold">AI Image Generator</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Describe Your Image</p>
        <textarea
          onChange={(e) => setInput(e.target.value)}
          value={input}
          rows={4}
          type="text"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300"
          placeholder="Describe what you want to see in the image..."
          required
        />
        <p className="mt-4 text-sm font-medium">Style</p>
        <div className="mt-3 flex gap-3 flex-wrap sm:max-w-9/11">
          {imageStyle.map((item, index) => (
            <span
              onClick={() => setSelectedStyle(item)}
              className={`text-xs px-4 py-1 bg-[#EFF6FF] border cursor-pointer rounded-full ${selectedStyle === item ? "bg-blue-50 text-blue-700" : "border-gray-300 text-gray-500"}`}
              key={index}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="my-6 flex items-center gap-2">
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              onChange={(e) => setPublish(e.target.checked)}
              checked={publish}
              className="peer sr-only"
            />
            <div className="relative h-5 w-9 rounded-full bg-slate-300 transition-colors peer-checked:bg-purple-500" />
            <span className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white transition-transform duration-300 peer-checked:translate-x-4" />
          </label>
          <p className="text-sm">Make this image public</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-linear-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-60"
        >
          <Image className="w-5" />
          {loading ? "Generating..." : "Generate Image"}
        </button>
      </form>

      {/* right col */}
      <ResultPanel
        icon={Image}
        title="Generated Images"
        resultType="image"
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

export default GenerateImages;
