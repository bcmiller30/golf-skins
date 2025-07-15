import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";

const NUM_HOLES = 18;
const DEFAULT_PAYOUT = 20;

export default function App() {
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

  const [editingGolfer, setEditingGolfer] = useState(null);
  const [editedName, setEditedName] = useState("");

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

    if (!name) return alert("Please enter a valid name.");
    if (golfers.includes(name)) return alert("That golfer is already added.");

    setGolfers([...golfers, name]);
    setGolferInput("");
  };


  const handleEditSave = () => {
    if (!editedName.trim() || golfers.includes(editedName)) return;
    const updated = golfers.map((g) => (g === editingGolfer ? editedName : g));
    const updatedWinners = holeWinners.map((w) =>
      w === editingGolfer ? editedName : w
    );
    setGolfers(updated);
    setHoleWinners(updatedWinners);
    setEditingGolfer(null);
  };

  const handleEditCancel = () => setEditingGolfer(null);

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
      <h1 className="text-xl font-bold mb-4">🏌️ Golf Skins Scorecard</h1>

      <div className="mb-2 text-sm">
        Total Purse: <strong>${purse}</strong> | Buy-in per golfer: <strong>${buyIn}</strong>
      </div>

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
        <label className="block mb-1">Add Golfer (Initials or Nickname)</label>
        <input
          type="text"
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
                  <th key={g} className="border p-2">
                    {editingGolfer === g ? (
                      <div className="flex items-center">
                        <input
                          className="border p-1 w-20 text-xs"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                        />
                        <button onClick={handleEditSave} className="ml-1 text-green-600">✔</button>
                        <button onClick={handleEditCancel} className="ml-1 text-red-600">✖</button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span>{g}</span>
                        <button
                          className="ml-1 text-blue-600 text-xs"
                          onClick={() => handleEditStart(g)}
                        >
                          ✏️
                        </button>
                      </div>
                    )}
                  </th>
                ))}
                <th className="border p-2">T</th>
                <th className="border p-2">Skins $</th>
              </tr>
            </thead>
            <tbody>
              {holeWinners.map((winner, idx) => {
                const swipeHandlers = useSwipeable({
                  onSwipedLeft: () => handleSwipeTie(idx),
                  preventDefaultTouchmoveEvent: true,
                  trackMouse: true,
                });

                return (
                  <tr
                    key={idx}
                    {...swipeHandlers}
                    className={winner === "T" ? "bg-yellow-100" : ""}
                  >
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
                        onClick={() => handleWinnerSelect(idx, g)}
                      >
                        {winner === g ? "✔" : ""}
                      </td>
                    ))}
                    <td
                      className={`border p-2 cursor-pointer ${
                        winner === "T" ? "bg-yellow-200" : ""
                      }`}
                      onClick={() => handleWinnerSelect(idx, "T")}
                    >
                      {winner === "T" ? "✔" : ""}
                    </td>
                    <td className="border p-2">${skinValues[idx]}</td>
                  </tr>
                );
              })}
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
