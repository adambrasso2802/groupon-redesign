import React, { useState } from "react";
import type { RefundPolicy } from "../types/deal";
import type { HelpSurface, SupportAction } from "../types/analytics";
import type { AnalyticsClient } from "../analytics/client";
import { SupportBottomSheet } from "./SupportBottomSheet";

export interface PostPurchaseHelpEntryProps {
  orderId: string;
  dealId: string;
  refundPolicy: RefundPolicy;
  surface: HelpSurface;
  analytics: AnalyticsClient;
  onActionSelected?: ((action: SupportAction) => void) | undefined;
}

const SURFACE_STYLES: Record<HelpSurface, React.CSSProperties> = {
  confirmation_screen: {
    borderTop: "1px solid #e5e7eb",
    padding: "20px 0 0",
    marginTop: 16,
  },
  voucher_card: {
    borderTop: "1px solid #e5e7eb",
    padding: "14px 0 0",
    marginTop: 12,
  },
  my_groupons: {
    padding: "10px 0 0",
  },
};

export function PostPurchaseHelpEntry({
  orderId,
  dealId,
  refundPolicy,
  surface,
  analytics,
  onActionSelected,
}: PostPurchaseHelpEntryProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  function handleOpen() {
    analytics.track({ event: "post_purchase_help_opened", orderId, surface });
    setSheetOpen(true);
  }

  function handleActionSelected(action: SupportAction) {
    onActionSelected?.(action);
  }

  return (
    <div
      data-testid="post-purchase-help-entry"
      data-surface={surface}
      style={SURFACE_STYLES[surface]}
    >
      <button
        data-testid="need-help-cta"
        onClick={handleOpen}
        style={{
          width: "100%",
          background: "transparent",
          color: "#2563eb",
          border: "2px solid #2563eb",
          borderRadius: 8,
          padding: "12px 20px",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <span aria-hidden="true">🙋</span> Need help?
      </button>

      <SupportBottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        orderId={orderId}
        refundPolicy={refundPolicy}
        analytics={analytics}
        onActionSelected={handleActionSelected}
      />
    </div>
  );
}
