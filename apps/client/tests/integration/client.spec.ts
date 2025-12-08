import { test, expect } from '@playwright/test';

test.describe('Client Integration Tests', () => {
  test('should create an event and see it in the list', async ({ page, context }) => {
    // Accept self-signed certificate
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // First, sign in using the real server story
    await page.goto('http://localhost:6006/iframe.html?id=pages-signin--real-server&viewMode=story');
    await page.waitForLoadState('networkidle');
    
    // Wait for sign in form
    await page.waitForSelector('text=Sign In', { timeout: 5000 });
    
    // Fill in name
    await page.locator('input[id="standard-basic"]').fill('Test User');
    
    // Click sign in button
    await page.click('button:has-text("Sign In")');
    
    // Wait a moment for sign in to complete
    await page.waitForTimeout(2000);

    // Navigate to the EventList story with real server
    await page.goto('http://localhost:6006/iframe.html?id=pages-eventlist--real-server&viewMode=story');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Wait for initial content to load - look for the "Add" button (Fab with AddIcon)
    await page.waitForSelector('button[aria-label="add"]', { timeout: 10000 });

    // Take initial screenshot
    await page.screenshot({ path: '/tmp/test-before-create.png' });

    // Get the initial number of events by counting list items
    const initialEventItems = await page.locator('ul > div').count();
    console.log(`Initial events count: ${initialEventItems}`);

    // Click the "Add Event" button
    await page.click('button[aria-label="add"]');

    // Wait for the dialog to appear
    await page.waitForSelector('text=Create a new event', { timeout: 5000 });

    // Fill in the event form using MUI TextField selectors
    const eventName = `Test Event ${Date.now()}`;
    
    // Fill Name field - find input with label "Name"
    await page.locator('input[id="standard-basic"]').first().fill(eventName);
    
    // Fill Points field - find the second input with same id
    await page.locator('input[id="standard-basic"]').nth(1).fill('10');

    // Click the Create button
    await page.click('button:has-text("Create")');

    // Wait for the dialog to close and the new event to appear
    await page.waitForSelector('text=Create a new event', { state: 'hidden', timeout: 5000 });

    // Wait a bit for the list to update
    await page.waitForTimeout(2000);

    // Navigate back to the event list
    await page.goto('http://localhost:6006/iframe.html?id=pages-eventlist--real-server&viewMode=story');
    await page.waitForLoadState('networkidle');

    // Wait for the list to load
    await page.waitForSelector('button[aria-label="add"]', { timeout: 10000 });

    // Take screenshot after creation
    await page.screenshot({ path: '/tmp/test-after-create.png' });

    // Verify that the event list has been updated
    const updatedEventItems = await page.locator('ul > div').count();
    console.log(`Updated events count: ${updatedEventItems}`);

    // Verify the new event is in the list
    await expect(page.locator(`text=${eventName}`).first()).toBeVisible({ timeout: 10000 });

    // Verify the count increased
    expect(updatedEventItems).toBeGreaterThan(initialEventItems);

    console.log('✓ Event created and verified in the list');
  });
});
