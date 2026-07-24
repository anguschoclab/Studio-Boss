const fs = require('fs');
const filepath = 'src/components/modals/DistressedAssetOfferModal.tsx';
let content = fs.readFileSync(filepath, 'utf8');
content = content.replace(
  '  if (!activeModal || activeModal.type !== "DISTRESSED_ASSET_OFFER") return null;\n\n  const { offerId = "" } = (activeModal.payload || {}) as { offerId: string };\n  const offer = gameState ? selectDistressedOffer(gameState, offerId) : null;\n\n  // Bug 3 fix: resolve in useEffect, not during render.\n  useEffect(() => {\n    if (!offer) {\n      resolveCurrentModal();\n    }\n  }, [offer, resolveCurrentModal]);',
  '  const { offerId = "" } = (activeModal?.payload || {}) as { offerId: string };\n  const offer = gameState && activeModal?.type === "DISTRESSED_ASSET_OFFER" ? selectDistressedOffer(gameState, offerId) : null;\n\n  // Bug 3 fix: resolve in useEffect, not during render.\n  useEffect(() => {\n    if (activeModal?.type === "DISTRESSED_ASSET_OFFER" && !offer) {\n      resolveCurrentModal();\n    }\n  }, [activeModal, offer, resolveCurrentModal]);\n\n  if (!activeModal || activeModal.type !== "DISTRESSED_ASSET_OFFER") return null;'
);
fs.writeFileSync(filepath, content);
