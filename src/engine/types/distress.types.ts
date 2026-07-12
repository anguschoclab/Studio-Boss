/** A crown-jewel franchise or catalog asset a distressed studio is fire-selling. */
export interface DistressedAssetOffer {
  id: string;
  sellerId: string;
  sellerName: string;
  assetKind: "franchise" | "vault";
  assetId: string;
  /** Display string, e.g. "franchise 'Nightfall'" or "'The Reckoning'". */
  assetLabel: string;
  price: number;
  /** Buyer that completes the deal if the player passes or the offer expires. */
  aiBuyerId: string;
  aiBuyerName: string;
  createdWeek: number;
  expiresWeek: number;
}
