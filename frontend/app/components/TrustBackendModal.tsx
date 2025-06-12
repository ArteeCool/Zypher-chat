"use client";

import React, { useEffect, useState } from "react";

const BACKEND_URL = "https://109.95.33.158:5678";

const TrustBackendModal = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log("hello");

    fetch(`${BACKEND_URL}/api/healthcheck`)
      .then((res) => {
        if (!res.ok) throw new Error("Backend not OK");
      })
      .catch(() => {
        setShowModal(true);
      });
  }, []);

  const handleTrustClick = () => {
    window.location.href = BACKEND_URL;
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md text-center shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-[#346739]">
              Trust the Backend
            </h2>
            <p className="text-[#889677] mb-4">
              To continue using chat features, please trust the backend server.
              Click below, accept the security warning, and you'll be redirected
              back.
            </p>
            <button
              onClick={handleTrustClick}
              className="bg-[#346739] text-white px-4 py-2 rounded-xl hover:bg-[#2a4f2a] transition"
            >
              Open Backend
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TrustBackendModal;
