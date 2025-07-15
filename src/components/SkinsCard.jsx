import React from "react";

export default function SkinsCard({ golfers, winnings, buyIn, purse }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
      <h2 className="text-lg font-bold mb-3 text-yellow-500 flex items-center">
        🏅 Final Standings
      </h2>
      <ul className="text-left space-y-1">
        {golfers.map((g) => {
          const net = winnings[g] - buyIn;
          return (
            <li key={g} className="flex justify-between text-sm md:text-base">
              <span className="font-medium">{g}</span>
              <span>
                Won <strong>${winnings[g]}</strong> — Net{" "}
                <span className={net >= 0 ? "text-green-500" : "text-red-500"}>
                  ${net}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-xs mt-4 text-gray-400">
        Total Purse: ${purse} | Buy-in per golfer: ${buyIn}
      </p>
    </div>
  );
}
