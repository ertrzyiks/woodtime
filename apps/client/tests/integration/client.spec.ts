import { test, expect } from '@playwright/test';

test.describe('Client Integration Tests', () => {
  test('should create an event and see it in the list', async ({ page, context }) => {
    // Accept self-signed certificate
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // First, sign in
    await page.goto('http://localhost:3000/sign-in');
    await page.waitForLoadState('networkidle');
    
    // Wait for sign in form
    await page.waitForSelector('text=Sign In', { timeout: 10000 });
    
    // Fill in name - the TextField has an input inside it
    const signInInput = page.locator('input[id="standard-basic"]');
    await signInInput.waitFor({ state: 'visible' });
    await signInInput.fill('Test User');
    
    // Click the submit button (Create button in sign in form)
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.waitFor({ state: 'visible' });
    await submitBtn.click();
    
    // Wait for redirect to home page (event list)
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 });

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Wait for initial content to load - look for the "Add" button/link (Fab with AddIcon)
    await page.waitForSelector('[aria-label="add"]', { timeout: 10000 });

    // Take initial screenshot
    await page.screenshot({ path: '/tmp/test-before-create.png' });

    // Get the initial number of events by counting list items
    const initialEventItems = await page.locator('ul > div').count();
    console.log(`Initial events count: ${initialEventItems}`);

    // Click the "Add Event" button/link
    await page.click('[aria-label="add"]');

    // Wait for the dialog to appear
    await page.waitForSelector('text=Create a new event', { timeout: 5000 });

    // Fill in the event form using MUI TextField selectors
    const eventName = `Test Event ${Date.now()}`;
    
    // Wait a bit for the dialog to fully render
    await page.waitForTimeout(500);
    
    // Fill Name field - find input with label "Name" inside the dialog
    const nameInput = page.locator('input[id="standard-basic"]').first();
    await nameInput.fill(eventName);
    
    // Fill Points field - find the second input with same id
    const pointsInput = page.locator('input[id="standard-basic"]').nth(1);
    await pointsInput.fill('10');

    // Click the Create button in the dialog
    await page.click('button:has-text("Create")');

    // Wait for navigation to the event page
    await page.waitForURL(/\/events\/\d+/, { timeout: 5000 });

    // Navigate back to the event list
    await page.goto('http://localhost:3000/');
    await page.waitForLoadState('networkidle');

    // Wait for the list to load
    await page.waitForSelector('[aria-label="add"]', { timeout: 10000 });

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
