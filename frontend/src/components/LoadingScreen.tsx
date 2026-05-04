'use client';
import React from 'react';

export default function LoadingScreen() {
  return (
    <>
      <style>{`
        @keyframes bar-bounce {
          0%, 100% { transform: scaleY(0.25); }
          50% { transform: scaleY(1); }
        }

        @keyframes loader-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes loader-fade-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }

        .loading-overlay {
          position: fixed;
          inset: 0;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          animation: loader-fade-in 0.2s ease forwards;
        }

        .loading-overlay.hiding {
          animation: loader-fade-out 0.4s ease forwards;
          pointer-events: none;
        }

        .loading-bars {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 52px;
        }

        .loading-bar {
          width: 5px;
          height: 100%;
          background-color: #4a75f5;
          border-radius: 4px;
          transform-origin: bottom center;
          animation: bar-bounce 0.9s ease-in-out infinite;
        }

        .loading-bar:nth-child(1) { animation-delay: 0s;    height: 22px; }
        .loading-bar:nth-child(2) { animation-delay: 0.18s; height: 38px; }
        .loading-bar:nth-child(3) { animation-delay: 0.36s; height: 52px; }
        .loading-bar:nth-child(4) { animation-delay: 0.18s; height: 38px; }
        .loading-bar:nth-child(5) { animation-delay: 0s;    height: 22px; }
      `}</style>

      <div className="loading-overlay">
        <div className="loading-bars">
          <div className="loading-bar" />
          <div className="loading-bar" />
          <div className="loading-bar" />
          <div className="loading-bar" />
          <div className="loading-bar" />
        </div>
      </div>
    </>
  );
}
