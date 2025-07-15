import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";

const NUM_HOLES = 18;
const DEFAULT_PAYOUT = 20;

export default function SkinsApp() {
  const [golferInput, setGolferInput] = useState("");
  const [golfers, setGolfers] = useState(() => {
    const saved = localStorage.getItem("golfers");
    return saved ? JSON.parse(saved) : [];
  });
  const [holeWinners, setHoleWinners] = useState(() => {
    const saved = localStorage.getItem("holeWinners");
    return saved ? JSON.parse(saved) : Array(NUM_HOLES).fill("");
  });
  const [payout, setPayout] = useState(() => {
    const saved = localStorage.getItem("payout");
    return saved ? parseInt(saved) : DEFAULT_PAYOUT;
  });

  useEffect(() => {
    localStorage.setItem("golfers", JSON.stringify(golfers));
    localStorage.setItem("holeWinners", JSON.stringify(holeWinners));
    localStorage.setItem("payout", payout);
  }, [golfers, holeWinners, payout]);

  const handleWinnerSelect = (holeIndex, winner) => {
    const updated = [...holeWinners];
    updated[holeIndex] = winner;
    setHoleWinners(updated);
  };

  const handleSwipeTie = (holeIndex) => {
    const updated = [...holeWinners];
    updated[holeIndex] = "T";
    setHoleWinners(updated);
  };

  const resetGame = () => {
    setHoleWinners(Array(NUM_HOLES).fill(""));
    setGolfers([]);
    setGolferInput("");
    setPayout(DEFAULT_PAYOUT);
    localStorage.removeItem("golfers");
    localStorage.removeItem("holeWinners");
    localStorage.removeItem("payout");
  };

  const addGolfer = () => {
    const name = golferInput.trim();
    if (!name) return alert("Enter a valid name.");
    if (golfers.includes(name)) return alert("Golfer already added.");
    setGolfers([...golfers, name]);
    setGolferInput("");
  };

  const getSkinValues = () => {
    const skinValues = Array(NUM_HOLES).fill(payout);
    for (let i = 1; i < NUM_HOLES; i++) {
      if (holeWinners[i - 1] === "T") {
        skinValues[i] += skinValues[i - 1];
        skinValues[i - 1] = 0;
      }
    }
    if (holeWinners[NUM_HOLES - 1] === "T") skinValues[NUM_HOLES - 1] = 0;
    return skinValues;
  };

  const skinValues = getSkinValues();
  const purse = NUM_HOLES * payout;
  const buyIn = golfers.length ? purse / golfers.length : 0;
  const winnings = {};
  golfers.forEach((g) => (winnings[g] = 0));
  holeWinners.forEach((winner, idx) => {
    if (golfers.includes(winner)) winnings[winner] += skinValues[idx];
  });

  return (
    <div className="max-w-2xl mx-auto p-2 md:p-4 text-center">
      <h1 className="text-xl font-bold mb-2">🏌️ Golf Skins Tracker</h1>

      <p className="text-sm mb-2">
        Total Purse: ${purse} | Buy-in per golfer: ${buyIn}
      </p>

      <div className="mb-4">
        <label className="block mb-1">Per-Hole Payout ($)</label>
        <input
          type="number"
          className="border p-2 w-32 text-center"
          value={payout}
          onChange={(e) => setPayout(Number(e.target.value))}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="golfer-name" className="block mb-1">Add Golfer</label>
        <input
          id="golfer-name"
          type="text"
          name="golfer"
          className="border p-2 mr-2"
          value={golferInput}
          onChange={(e) => setGolferInput(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-3 py-2 rounded"
          onClick={addGolfer}
        >
          Add
        </button>
      </div>

      {golfers.length > 0 && (
        <div className="w-full overflow-x-auto">
          <table className="table-auto w-full border text-xs md:text-sm mb-6">
            <thead>
              <tr>
                <th className="border p-2">Hole</th>
                {golfers.map((g) => (
                  <th key={g} className="border p-2">{g}</th>
                ))}
                <th className="border p-2">T</th>
                <th className="border p-2">Skins $</th>
              </tr>
            </thead>
            <tbody>
              {holeWinners.map((winner, idx) => (
                <HoleRow
                  key={idx}
                  idx={idx}
                  winner={winner}
                  golfers={golfers}
                  skinValue={skinValues[idx]}
                  onWinnerSelect={handleWinnerSelect}
                  onSwipeTie={handleSwipeTie}
                />
              ))}
            </tbody>
          </table>

          <h2 className="text-lg font-semibold mb-2">💰 Results</h2>
          <ul className="mb-4">
            {golfers.map((g) => (
              <li key={g} className="mb-1">
                <strong>{g}:</strong> Won ${winnings[g]} — Net ${winnings[g] - buyIn}
              </li>
            ))}
          </ul>

          <button
            className="bg-red-500 text-white px-4 py-2 text-sm md:text-base rounded"
            onClick={resetGame}
          >
            Reset Game
          </button>
        </div>
      )}
    </div>
  );
}

function HoleRow({ idx, winner, golfers, skinValue, onWinnerSelect, onSwipeTie }) {
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onSwipeTie(idx),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <tr {...swipeHandlers} className={winner === "T" ? "bg-yellow-100" : ""}>
      <td className="border p-2 font-semibold relative">
        {idx + 1}
        {winner === "T" && (
          <span className="absolute inset-0 flex items-center justify-center text-yellow-600 font-bold text-xs md:text-sm">
            TIE
          </span>
        )}
      </td>
      {golfers.map((g) => (
        <td
          key={g}
          className={`border p-2 cursor-pointer ${
            winner === g ? "bg-green-200" : ""
          }`}
          onClick={() => onWinnerSelect(idx, g)}
        >
          {winner === g ? "✔" : ""}
        </td>
      ))}
      <td
        className={`border p-2 cursor-pointer ${
          winner === "T" ? "bg-yellow-200" : ""
        }`}
        onClick={() => onWinnerSelect(idx, "T")}
      >
        {winner === "T" ? "✔" : ""}
      </td>
      <td className="border p-2">${skinValue}</td>
    </tr>
  );
}
