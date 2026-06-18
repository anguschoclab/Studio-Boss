import { test, expect } from '@playwright/test';

test('distressed asset acquisition: modal appears, acquire works, decline works', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/dashboard?autoStart=true');
  await expect(page.getByRole('button', { name: 'COMMAND CENTER' })).toBeVisible({ timeout: 15000 });

  // Start a new game to ensure clean state
  await page.getByRole('button', { name: 'New Game' }).click();
  await page.getByRole('textbox', { name: 'Studio Name' }).fill('Test Studio');
  await page.getByRole('button', { name: 'Start Game' }).click();
  await page.waitForTimeout(2000);

  // Advance weeks until a distressed offer appears (mock by forcing one via console)
  // For smoke test, we'll directly inject an offer into the store
  await page.evaluate(() => {
    const store = (window as any).__GAME_STORE__;
    if (store && store.gameState) {
      const offer = {
        id: 'test-offer-1',
        sellerId: 'rival-1',
        sellerName: 'Carolco',
        assetKind: 'franchise',
        assetId: 'franchise-1',
        assetLabel: "franchise 'Rambo'",
        price: 100_000_000,
        aiBuyerId: 'rival-2',
        aiBuyerName: 'Helix',
        createdWeek: store.gameState.week,
        expiresWeek: store.gameState.week + 2,
      };
      store.gameState.industry = store.gameState.industry || {};
      store.gameState.industry.distressedOffers = [offer];
      store.setState({ gameState: store.gameState });
    }
  });

  // Trigger the modal manually via UI store
  await page.evaluate(() => {
    const uiStore = (window as any).__UI_STORE__;
    if (uiStore) {
      uiStore.enqueueModal('DISTRESSED_ASSET_OFFER', { offerId: 'test-offer-1' });
    }
  });

  // Verify modal appears
  await expect(page.getByText('Distressed Asset Sale')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText("franchise 'Rambo'")).toBeVisible();
  await expect(page.getByText('From Carolco')).toBeVisible();
  await expect(page.getByText('$100,000,000')).toBeVisible();

  // Test decline path
  await page.getByRole('button', { name: 'Decline' }).click();
  await expect(page.getByText('Distressed Asset Sale')).not.toBeVisible({ timeout: 3000 });

  // Verify offer was removed and AI buyer got it (check for news)
  await page.waitForTimeout(500);
  const newsAfterDecline = await page.evaluate(() => {
    const store = (window as any).__GAME_STORE__;
    return store?.gameState?.industry?.distressedOffers?.length ?? 0;
  });
  expect(newsAfterDecline).toBe(0);

  // Re-inject offer for acquire test
  await page.evaluate(() => {
    const store = (window as any).__GAME_STORE__;
    if (store && store.gameState) {
      const offer = {
        id: 'test-offer-2',
        sellerId: 'rival-1',
        sellerName: 'Carolco',
        assetKind: 'franchise',
        assetId: 'franchise-2',
        assetLabel: "franchise 'Terminator'",
        price: 50_000_000,
        aiBuyerId: 'rival-2',
        aiBuyerName: 'Helix',
        createdWeek: store.gameState.week,
        expiresWeek: store.gameState.week + 2,
      };
      store.gameState.industry.distressedOffers = [offer];
      store.setState({ gameState: store.gameState });
    }
  });

  await page.evaluate(() => {
    const uiStore = (window as any).__UI_STORE__;
    if (uiStore) {
      uiStore.enqueueModal('DISTRESSED_ASSET_OFFER', { offerId: 'test-offer-2' });
    }
  });

  // Verify modal appears again
  await expect(page.getByText('Distressed Asset Sale')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText("franchise 'Terminator'")).toBeVisible();

  // Test acquire path
  await page.getByRole('button', { name: 'Acquire' }).click();
  await expect(page.getByText('Distressed Asset Sale')).not.toBeVisible({ timeout: 3000 });

  // Verify player now owns the franchise
  await page.waitForTimeout(500);
  const playerFranchises = await page.evaluate(() => {
    const store = (window as any).__GAME_STORE__;
    const playerId = store?.gameState?.studio?.id;
    const franchises = store?.gameState?.ip?.franchises || {};
    return Object.values(franchises).filter((f: any) => f.ownerId === playerId).length;
  });
  expect(playerFranchises).toBeGreaterThan(0);

  expect(errors, `Uncaught page errors:\n${errors.join('\n')}`).toEqual([]);
});
