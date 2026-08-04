import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Crown, Gauge, Loader2, Sparkle, Trash2 } from "lucide-react";
import { Show } from "@clerk/react";
import { useApi } from "../config/api";
import CreationItem from "../components/CreationItem";

const FREE_LIMIT = 10;

const Dashboard = () => {
  const navigate = useNavigate();
  const { request } = useApi();

  const [creations, setCreations] = useState([]);
  const [plan, setPlan] = useState("free");
  const [freeUsage, setFreeUsage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    request("/ai/creations")
      .then((data) => {
        setCreations(data.creations || []);
        setPlan(data.plan);
        setFreeUsage(data.free_usage || 0);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [request]);

  const handleDelete = async (id) => {
    try {
      await request(`/ai/creations/${id}`, { method: "DELETE" });
      setCreations((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const isPremium = plan === "premium";
  const usesLeft = Math.max(0, FREE_LIMIT - freeUsage);

  return (
    <div className="h-full overflow-y-scroll p-6">
      <div className="flex justify-start gap-4 flex-wrap">
        {/* total creation card */}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200">
          <div className="text-slate-600">
            <p className="text-sm">Total Creations</p>
            <h2 className="text-xl font-semibold">{creations.length}</h2>
          </div>
          <div className="w-10 h-10 rounded-lg bg-black flex justify-center items-center">
            <Sparkle className="w-5 text-white" />
          </div>
        </div>

        {/* Active plan */}
        <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200">
          <div className="text-slate-600">
            <p className="text-sm">Active Plan</p>
            <h2 className="text-xl font-semibold">
              <Show when={{ plan: "premium" }} fallback="Free">
                Premium
              </Show>
            </h2>
          </div>
          <div
            className={`w-10 h-10 rounded-lg flex justify-center items-center ${isPremium ? "bg-yellow-400" : "bg-black"}`}
          >
            {isPremium ? (
              <Crown className="w-5 text-white" />
            ) : (
              <Sparkle className="w-5 text-white" />
            )}
          </div>
        </div>

        {/* Free usage card */}
        {!isPremium && (
          <div className="flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200">
            <div className="text-slate-600">
              <p className="text-sm">Free Uses Left</p>
              <h2 className="text-xl font-semibold">
                {usesLeft}/{FREE_LIMIT}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-lg bg-black flex justify-center items-center">
              <Gauge className="w-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Upgrade banner */}
      {!isPremium && (
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-6 flex w-full max-w-5xl items-center justify-between rounded-xl border border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-100 px-6 py-4 text-left cursor-pointer"
        >
          <div>
            <h3 className="font-semibold text-slate-800">
              Unlock unlimited creations with Premium
            </h3>
            <p className="text-sm text-gray-500">
              Generate images, remove backgrounds, remove objects and more.
            </p>
          </div>
          <span className="rounded-lg bg-primary px-4 py-2 text-sm text-white">
            Upgrade
          </span>
        </button>
      )}

      <div className="space-y-3">
        <p className="mt-6 mb-4 font-medium">Recent Creations</p>

        {loading ? (
          <div className="flex items-center gap-3 text-gray-400 p-6">
            <Loader2 className="w-5 animate-spin" />
            <p className="text-sm">Loading your creations...</p>
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 p-6">{error}</p>
        ) : creations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400">
            <Trash2 className="mx-auto mb-3 w-8 text-gray-300" />
            <p>No creations yet. Start generating with an AI tool!</p>
          </div>
        ) : (
          creations.map((item) => (
            <CreationItem
              key={item.id}
              item={item}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
