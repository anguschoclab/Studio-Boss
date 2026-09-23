import React, { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { useUIStore } from "@/store/uiStore";
import { Button } from "@/components/ui/button";
import { Gavel, Users } from "lucide-react";
import type { FestivalAuctionResult } from "@/engine/systems/festivals/festivalAuctionEngine";
import { formatMoney } from "@/engine/utils";
import { applyStateImpact } from "@/store/storeUtils";

/**
 * FestivalMarketModal: presents the festival auction results for the player's
 * submitted projects. The player accepts the winning bid (selling distribution
 * rights for the winning amount) or declines.
 */
export const FestivalMarketModal: React.FC = () => {
  const gameState = useGameStore((s) => s.gameState);
  const addFunds = useGameStore((s) => s.addFunds);
  const { activeModal, resolveCurrentModal } = useUIStore();

  const results =
    (activeModal?.type === "FESTIVAL_MARKET" ? activeModal.payload.results : []) ?? [];
  const festivalBody =
    activeModal?.type === "FESTIVAL_MARKET" ? activeModal.payload.festivalBody : undefined;

  // If the payload is malformed, resolve rather than jam the modal queue.
  useEffect(() => {
    if (activeModal?.type === "FESTIVAL_MARKET" && results.length === 0) {
      resolveCurrentModal();
    }
  }, [activeModal, results.length, resolveCurrentModal]);

  if (activeModal?.type !== "FESTIVAL_MARKET" || !gameState || results.length === 0) return null;

  const winnerName = (r: FestivalAuctionResult): string => {
    if (!r.winnerId) return "No bids";
    const bid = r.bids.find((b) => b.bidderId === r.winnerId);
    return bid?.bidderName ?? gameState.entities.rivals[r.winnerId]?.name ?? "Unknown Studio";
  };

  const settleSubmissions = (status: "selected" | "rejected") => {
    const state = useGameStore.getState().gameState;
    const subs = state?.industry?.festivalSubmissions;
    if (!state || !subs?.length) return;
    const soldIds = new Set(results.map((r) => r.projectId));
    const updated = subs.map((s) =>
      soldIds.has(s.projectId) && (s.status === "submitted" || s.status === "selected")
        ? { ...s, status }
        : s
    );
    useGameStore.setState({
      gameState: applyStateImpact(state, {
        type: "INDUSTRY_UPDATE",
        payload: { update: { "industry.festivalSubmissions": updated } },
      }),
    });
  };

  const handleAccept = () => {
    const total = results.reduce((sum, r) => sum + (r.winningAmount || 0), 0);
    if (total > 0) addFunds(total);
    settleSubmissions("selected");
    resolveCurrentModal();
  };

  const handleDecline = () => {
    settleSubmissions("rejected");
    resolveCurrentModal();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-black border border-white/5 rounded-none shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <Gavel className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
              Festival Market Results
            </span>
          </div>
          <h2 className="text-2xl font-display font-black tracking-tight text-white line-clamp-1">
            {festivalBody ?? "Festival Auction"}
          </h2>
        </div>

        {/* Results */}
        <div className="p-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
          {results.map((r) => (
            <div
              key={r.projectId}
              className="border border-white/10 rounded-none p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">{r.projectTitle}</div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    {r.bids.length} bid{r.bids.length === 1 ? "" : "s"}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span>Top bidder: {winnerName(r)}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                  Winning Bid
                </div>
                <div className="text-xl font-display font-black text-amber-500 tabular-nums">
                  {r.winnerId ? formatMoney(r.winningAmount) : "—"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="p-4 bg-black/40 border-t border-white/5 flex justify-end gap-3">
          <Button variant="outline" onClick={handleDecline}>
            Decline
          </Button>
          <Button
            onClick={handleAccept}
            disabled={results.every((r) => !r.winnerId || r.winningAmount <= 0)}
            className="bg-white text-black hover:bg-slate-200 font-black uppercase tracking-wider"
          >
            Accept {formatMoney(results.reduce((s, r) => s + (r.winningAmount || 0), 0))}
          </Button>
        </div>
      </div>
    </div>
  );
};
