import { useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import { Heart, Loader2 } from "lucide-react";
import { useApi } from "../config/api";

const Community = () => {
  const { request } = useApi();
  const { user } = useUser();

  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likingId, setLikingId] = useState(null);

  useEffect(() => {
    if (!user) return;
    request("/ai/community")
      .then((data) => {
        setCreations(data.creations || []);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, request]);

  const handleLike = async (creation, index) => {
    setLikingId(creation.id);
    const alreadyLiked = (creation.likes || []).includes(user?.id);

    setCreations((prev) =>
      prev.map((c, i) =>
        i === index
          ? {
              ...c,
              likes: alreadyLiked
                ? c.likes.filter((id) => id !== user?.id)
                : [...(c.likes || []), user?.id],
            }
          : c
      )
    );

    try {
      const data = await request("/ai/like", {
        method: "POST",
        body: { creationId: creation.id },
      });
      setCreations((prev) =>
        prev.map((c) => (c.id === creation.id ? { ...c, likes: data.likes } : c))
      );
    } catch (err) {
      setCreations((prev) =>
        prev.map((c, i) => (i === index ? { ...c, likes: creation.likes } : c))
      );
      alert(err.message);
    } finally {
      setLikingId(null);
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col gap-4 p-6">
      <h1 className="text-xl font-semibold text-slate-800">
        Community Creations
      </h1>

      {loading ? (
        <div className="flex items-center gap-3 text-gray-400 p-6">
          <Loader2 className="w-5 animate-spin" />
          <p className="text-sm">Loading community creations...</p>
        </div>
      ) : error ? (
        <p className="text-sm text-red-500 p-6">{error}</p>
      ) : creations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400">
          <p>No published creations yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="bg-white h-full w-full rounded-xl overflow-y-scroll">
          {creations.map((creation, index) => {
            const liked = (creation.likes || []).includes(user?.id);
            return (
              <div
                key={creation.id}
                className="relative group inline-block pl-3 pt-3 w-full sm:max-w-1/2 lg:max-w-1/3"
              >
                <img
                  src={creation.content}
                  alt={creation.prompt}
                  className="w-full h-full object-cover rounded-lg"
                />

                <div className="absolute bottom-0 top-0 right-0 left-3 flex gap-2 items-end justify-end group-hover:justify-between p-3 group-hover:bg-linear-to-b from-transparent to-black/80 text-white rounded-lg">
                  <div className="hidden group-hover:block text-sm max-w-[60%]">
                    {creation.author?.image && (
                      <img
                        src={creation.author.image}
                        alt={creation.author.name}
                        className="w-6 h-6 rounded-full inline-block mr-2"
                      />
                    )}
                    <span className="text-xs text-gray-200">
                      {creation.author?.name}
                    </span>
                    <p className="mt-1 line-clamp-2">{creation.prompt}</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <p>{creation.likes.length}</p>
                    <Heart
                      onClick={() => handleLike(creation, index)}
                      className={`min-h-5 h-5 hover:scale-110 cursor-pointer transition-transform ${liked ? "fill-red-500 text-red-600" : "text-white"} ${likingId === creation.id ? "opacity-60" : ""}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Community;
