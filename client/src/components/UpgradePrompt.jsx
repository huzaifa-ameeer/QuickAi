import { useNavigate } from "react-router-dom";
import { Crown } from "lucide-react";

const UpgradePrompt = ({ open, message, onClose }) => {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
          <Crown className="h-6 w-6 text-yellow-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">
          Upgrade Required
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          {message ||
            "This feature is available on the Premium plan. Upgrade to keep creating."}
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 rounded-lg bg-primary py-2 text-sm text-white cursor-pointer"
          >
            View Plans
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;
