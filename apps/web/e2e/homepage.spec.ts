import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the welcome message', async ({ page }) => {
    await page.goto('/')
    
    // Check if the main heading is visible
    await expect(page.getByRole('heading', { name: 'Welcome to ZERGO QR' })).toBeVisible()
    
    // Check if the description is visible
    await expect(page.getByText('Restaurant QR Code Ordering System')).toBeVisible()
    
    // Check if the setup completion message is visible
    await expect(page.getByText('Monorepo setup complete with Next.js 14, TypeScript 5.2, and Turborepo')).toBeVisible()
  })

  test('should have correct page title', async ({ page }) => {
    await page.goto('/')
    
    await expect(page).toHaveTitle(/ZERGO QR - Restaurant Ordering System/)
  })

  test('should be responsive', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Welcome to ZERGO QR' })).toBeVisible()
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByRole('heading', { name: 'Welcome to ZERGO QR' })).toBeVisible()
  })
})
