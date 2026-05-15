import React, { useEffect } from "react";
import type { AnalyticsClient } from "../analytics/client";

export interface InAppThreeDChallengeProps {
  dealId: string;
  analytics: AnalyticsClient;
  onSuccess: () => void;
  onDismiss: () => void;
}

export function InAppThreeDChallenge({
  dealId,
  analytics,
  onSuccess,
  onDismiss,
}: InAppThreeDChallengeProps) {
  useEffect(() => {
    analytics.track({ event: "three_ds_challenge_started", dealId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAuthenticate() {
    analytics.track({ event: "three_ds_challenge_succeeded", dealId });
    onSuccess();
  }

  function handleCancel() {
    analytics.track({ event: "three_ds_challenge_failed", dealId });
    onDismiss();
  }

  return (
    <div
      data-testid="three-ds-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Card authentication"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      <div
        data-testid="three-ds-modal"
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          width: "90%",
          maxWidth: 400,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div aria-hidden="true" style={{ fontSize: 40, marginBottom: 8 }}>🔒</div>
          <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700 }}>
            Verify Your Card
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
            Your bank requires additional verification to complete this purchase.
          </p>
        </div>

        <div
          data-testid="three-ds-bank-frame"
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            padding: "16px",
            marginBottom: 20,
            background: "#f9fafb",
            textAlign: "center",
          }}
        >
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#374151" }}>
            Secure Bank Authentication
          </p>
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#9ca3af" }}>
            Simulated inline 3DS challenge
          </p>
          <input
            data-testid="three-ds-otp-input"
            type="text"
            placeholder="Enter OTP from your bank"
            maxLength={6}
            aria-label="One-time passcode"
            style={{
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 16,
              textAlign: "center",
              letterSpacing: "0.25em",
              width: "100%",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            data-testid="three-ds-authenticate-btn"
            onClick={handleAuthenticate}
            style={{
              background: "#22c55e",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "13px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Authenticate
          </button>
          <button
            data-testid="three-ds-cancel-btn"
            onClick={handleCancel}
            style={{
              background: "transparent",
              color: "#6b7280",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "13px",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
