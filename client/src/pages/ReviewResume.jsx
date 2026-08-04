import { FileText, Sparkles } from "lucide-react";
import { useState } from "react";
import { useApi, isUpgradeError } from "../config/api";
import ResultPanel from "../components/ResultPanel";
import UpgradePrompt from "../components/UpgradePrompt";

const ReviewResume = () => {
  const { request } = useApi();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const data = await request("/ai/review-resume", {
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
          <h1 className="text-xl font-semibold">Review Resume</h1>
        </div>
        <p className="mt-6 text-sm font-medium">Upload Resume</p>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          accept="application/pdf"
          type="file"
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 cursor-pointer"
          required
        />

        <p className="text-sm text-gray-500 font-light mt-5 mb-3">
          Supports PDF resume only
        </p>

        <button
          type="submit"
          disabled={loading || !file}
          className="w-full flex justify-center items-center gap-2 bg-linear-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-60"
        >
          <FileText className="w-5" />
          {loading ? "Reviewing..." : "Review Resume"}
        </button>
      </form>

      {/* right col */}
      <ResultPanel
        icon={FileText}
        title="Analysis Results"
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

export default ReviewResume;
