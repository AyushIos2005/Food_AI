import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { getAllFood } from "../api/food";
import TopBar from "../components/TopBar";

export default function RandomDish() {
  const [dishes, setDishes] = useState([]);
  const [current, setCurrent] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getAllFood()
      .then((res) => {
        const list = res.foods || [];
        setDishes(list);
        if (list.length) setCurrent(list[Math.floor(Math.random() * list.length)]);
      })
      .catch((err) => setError(err.message));
  }, []);

  const tryAnother = () => {
    if (dishes.length < 2) return;
    let next;
    do {
      next = dishes[Math.floor(Math.random() * dishes.length)];
    } while (next._id === current?._id);
    setCurrent(next);
  };

  return (
    <div className="min-h-dvh bg-dark text-white flex flex-col">
      <TopBar title="Random Dish" onBack={() => navigate(-1)} />

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-4">
        <p className="uppercase tracking-[3px] text-[11px] text-orange-400 flex items-center gap-1.5">
          <Sparkles size={13} /> Surprise Me!
        </p>

        {error && <p className="text-[12px] text-red-400">{error}</p>}
        {!current && !error && (
          <p className="text-[13px] text-white/50">Loading a surprise dish...</p>
        )}

        {current && (
          <>
            <div className="w-56 h-56 rounded-[28px] bg-white/5 overflow-hidden">
              {current.foodImage ? (
                <img src={current.foodImage} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🍲</div>
              )}
            </div>
            <h2 className="text-xl font-bold mt-2">{current.foodName}</h2>
            <p className="text-[13px] text-white/50 max-w-[260px]">
              {current.description || "A dish worth discovering, curated just for you."}
            </p>
          </>
        )}
      </div>

      <div className="px-8 pb-10 flex flex-col gap-3">
        <button
          onClick={tryAnother}
          disabled={dishes.length < 2}
          className="py-3.5 rounded-2xl border border-white/20 text-white text-[14px] font-medium disabled:opacity-40"
        >
          Try Another
        </button>
        <button
          className="btn-primary"
          disabled={!current}
          onClick={() => navigate(`/dish/${current._id}`, { state: { dish: current } })}
        >
          View Dish
        </button>
      </div>
    </div>
  );
}
