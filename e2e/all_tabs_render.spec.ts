import { test, expect } from '@playwright/test';

const TABS = [
  'COMMAND CENTER',
  'PRODUCTION PIPELINE',
  'THE TRADES',
  'TALENT HUB',
  'DISTRIBUTION HUB',
  'IP VAULT',
  'INDUSTRY INTELLIGENCE',
  'FINANCE COMMAND',
  'WATCHLIST',
];

test('every dashboard tab renders without the error boundary', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/dashboard?autoStart=true');
  // Wait for the game shell to mount.
  await expect(page.getByRole('button', { name: 'COMMAND CENTER' })).toBeVisible({ timeout: 15000 });

  for (const tab of TABS) {
    await page.getByRole('button', { name: tab }).click();
    // The CatchBoundary renders this exact text when a tab throws.
    await expect(page.getByText('Something went wrong!')).toHaveCount(0);
    // Give lazy chunks a beat to mount and potentially throw.
    await page.waitForTimeout(400);
    await expect(page.getByText('Something went wrong!')).toHaveCount(0);
  }

  expect(errors, `Uncaught page errors:\n${errors.join('\n')}`).toEqual([]);
});
