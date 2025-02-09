import clsx from "clsx";
import React from "react";

interface StatCardProps {
  type: "students" | "updateStudent" | "deleteStudent";
  count: number;
  label: string;
  icon: string;
}

const StatCard = ({ count = 0, label, icon, type }: StatCardProps) => {
  return (
    <div
      className={clsx(
        "p-6 rounded-xl shadow-lg flex flex-col justify-between items-center bg-gradient-to-r from-white/10 to-gray-900 text-white w-full h-32"
      )}
    >
      <div className="flex items-center gap-4">
        <img src={icon} alt={label} className="w-12 h-12" />
        <p className="text-4xl font-bold">{count}</p>
      </div>
      <h2 className="text-xl font-semibold text-center w-full">{label}</h2>
    </div>
  );
};

export default StatCard;
