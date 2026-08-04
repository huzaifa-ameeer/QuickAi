import { Eraser, Sparkles } from "lucide-react";
import { useState } from "react";
import { useApi, isUpgradeError } from "../config/api";
import ResultPanel from "../components/ResultPanel";
import UpgradePrompt from "../components/UpgradePrompt";

const RemoveBackground = () => {
  const { request } = useApi();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0] || null;
    setFile(selected);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(selected ? URL.createObjectURL(selected) : "");
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const data = await request("/ai/remove-background", {
        method: "POST",
        body: formData,
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
          <h1 className="text-xl font-semibold">Background Removal</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Upload Image</p>
        <input
          onChange={handleFileChange}
          accept="image/*"
          type="file"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 cursor-pointer"
          required
        />

        {preview && (
          <img
            src={preview}
            alt="Upload preview"
            className="mt-4 max-h-48 w-full object-contain rounded-lg border border-gray-200"
          />
        )}

        <p className="text-sm text-gray-500 font-light mt-5 mb-3">
          Supports JPG, PNG, and other image formats
        </p>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full flex justify-center items-center gap-2 bg-linear-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-60"
        >
          <Eraser className="w-5" />
          {loading ? "Processing..." : "Remove Background"}
        </button>
      </form>

      {/* right col */}
      <ResultPanel
        icon={Eraser}
        title="Processed Image"
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

export default RemoveBackground;
