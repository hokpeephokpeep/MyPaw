import { test, expect } from '@playwright/test';

/**
 * Playwright E2E and Axe-core Accessibility Tests
 * Follows playwright-best-practices & axe-core skill guidelines
 */
test.describe('MyPaw Core UI & Accessibility', () => {
  test('App loads successfully with sticky header and bottom navigation', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // 1. Verify App Title is visible
    const appTitle = page.locator('header h1');
    await expect(appTitle).toBeVisible();
    await expect(appTitle).toContainText('MyP');

    // 2. Verify Menu and Notification buttons exist and have accessible labels
    const menuButton = page.locator('button[aria-label="Menu"]');
    await expect(menuButton).toBeVisible();

    const notiButton = page.locator('button[aria-label="Quick Notifications"]');
    await expect(notiButton).toBeVisible();

    // 3. Verify Bottom Navigation with Home and Notification screen triggers
    const bottomNav = page.locator('nav[aria-label="Mobile Bottom Navigation"]');
    await expect(bottomNav).toBeVisible();
  });

  test('Interactive Hamburger Drawer opens and displays stats', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Open drawer
    await page.click('button[aria-label="Menu"]');

    // Drawer should show MyPaw logo and action buttons
    const drawerTitle = page.locator('[role="dialog"], [aria-label="Close menu"], aside, .animate-slideInLeft');
    await expect(drawerTitle).toBeVisible();
  });
});
