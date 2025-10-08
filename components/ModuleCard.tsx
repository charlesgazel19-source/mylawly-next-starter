import React from "react";

export type ModuleType = {
  id: string;
  title?: string;
  steps?: Array<{ question: string; answer?: string }>;
};

export default function ModuleCard({ module }: { module: ModuleType }) {
  return (
    <div className="rounded-md shadow p-4 bg-slate-50">
      <h2 className="text-lg font-semibold mb-2">{module.title ?? `Module ${module.id}`}</h2>
      {Array.isArray(module.steps) && module.steps.length > 0 ? (
        <ul className="space-y-2">
          {module.steps.map((step, idx) => (
            <li key={idx} className="border-b pb-2 last:border-b-0">
              <div className="font-medium text-sm text-gray-700 mb-1">{step.question}</div>
              <div className="text-gray-900">{step.answer ?? <span className="italic text-gray-400">Non répondu</span>}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Aucune étape renseignée.</p>
      )}
    </div>
  );
}
