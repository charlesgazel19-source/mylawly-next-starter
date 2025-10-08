"use client";
import React from "react";

type Props = {
  message: string;
  retry?: () => void;
};

export default function ErrorBanner({ message, retry }: Props) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert" aria-live="polite">
      <span className="block sm:inline">{message}</span>
      {retry && (
        <button className="ml-4 text-red-800 underline" onClick={retry} autoFocus>
          Réessayer
        </button>
      )}
    </div>
  );
}
