import { test, expect } from '@playwright/test';

test.describe('Development Auto-Start Bypass', () => {
  test('should bypass setup flow when ?autoStart=true is present', async ({ page }) => {
    // 1. Go directly to dashboard with autoStart param
    await page.goto('/dashboard?autoStart=true');

    // 2. We should stay on the dashboard (no redirect to /)
    await expect(page).toHaveURL(/\/dashboard/);

    // 3. Verify that the dashboard is rendered (e.g. the TopBar with 'Fiscal Period')
    await expect(page.getByText('Fiscal Period')).toBeVisible({ timeout: 15000 });
    
    // Check if Alpha Studios (default dev studio) is mentioned
    await expect(page.getByText('Alpha Studios')).toBeVisible();
  });

  test('should bypass setup flow from root when ?autoStart=true is present', async ({ page }) => {
    // 1. Go to root with autoStart param
    await page.goto('/?autoStart=true');

    // 2. We should be automatically navigated to /dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // 3. Verify content
    await expect(page.getByText('Alpha Studios')).toBeVisible({ timeout: 15000 });
  });
});
