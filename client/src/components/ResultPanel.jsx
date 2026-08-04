import { useState } from "react";
import Markdown from "react-markdown";
import { Check, Copy, Download, FileWarning, Loader2 } from "lucide-react";

const ResultPanel = ({
  icon: Icon,
  title,
  loading = false,
  error = "",
  result = "",
  resultType = "text",
}) => {
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const downloadImage = () => {
    const a = document.createElement("a");
    a.href = result;
    a.download = "result.png";
    a.click();
  };

  return (
    <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96">
      <div className="flex items-center gap-3">
        <Icon className="w-10 p-2.5 h-10 rounded-lg text-white bg-black" />
        <h1 className="text-xl font-semibold">{title}</h1>
        {result && !loading && (
          <div className="ml-auto">
            {resultType === "image" ? (
              <button
                type="button"
                onClick={downloadImage}
                title="Download"
                className="p-2 rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <Download className="w-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={copyText}
                title="Copy"
                className="p-2 rounded-md hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                {copied ? (
                  <Check className="w-5 text-green-500" />
                ) : (
                  <Copy className="w-5" />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col justify-center items-center gap-4 text-gray-400">
          <Loader2 className="w-9 h-9 animate-spin" />
          <p className="text-sm">Generating... this may take a few seconds</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col justify-center items-center gap-4 text-red-400 text-center p-4">
          <FileWarning className="w-9 h-9" />
          <p className="text-sm">{error}</p>
        </div>
      ) : result ? (
        <div className="flex-1 overflow-y-scroll mt-4 max-h-[360px]">
          {resultType === "image" ? (
            <img
              src={result}
              alt="Generated result"
              className="w-full rounded-lg border border-gray-200"
            />
          ) : (
            <div className="reset-tw text-sm text-slate-700">
              <Markdown>{result}</Markdown>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex justify-center items-center">
          <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
            <Icon className="w-9 h-9" />
            <p>Your result will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultPanel;
