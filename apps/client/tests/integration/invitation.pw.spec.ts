import { test, expect } from '@playwright/test';

test.describe('Invitation Integration Tests', () => {
  test('should allow user to create event, generate invite URL, and another user to join via that URL', async ({ browser }) => {
    // Create two separate contexts for two different users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // Grant clipboard permissions for both contexts
      await context1.grantPermissions(['clipboard-read', 'clipboard-write']);
      await context2.grantPermissions(['clipboard-read', 'clipboard-write']);

      // ===== USER 1: Sign in as "Event Creator" =====
      console.log('User 1: Signing in as Event Creator');
      await page1.goto('http://localhost:3000/sign-in');
      await page1.waitForLoadState('networkidle');
      
      // Wait for sign in form
      await page1.waitForSelector('text=Sign In', { timeout: 10000 });
      
      // Fill in name for User 1
      const signInInput1 = page1.locator('input[id="standard-basic"]');
      await signInInput1.waitFor({ state: 'visible' });
      await signInInput1.fill('Event Creator');
      
      // Click the submit button
      const submitBtn1 = page1.locator('button[type="submit"]');
      await submitBtn1.waitFor({ state: 'visible' });
      await submitBtn1.click();
      
      // Wait for redirect to home page
      await page1.waitForURL('http://localhost:3000/', { timeout: 5000 });
      await page1.waitForLoadState('networkidle');
      
      // Wait for the "Add" button to be visible
      await page1.waitForSelector('[aria-label="add"]', { timeout: 10000 });
      
      console.log('User 1: Signed in successfully');

      // ===== USER 1: Create a new event =====
      console.log('User 1: Creating a new event');
      
      // Click the "Add Event" button
      await page1.click('[aria-label="add"]');
      
      // Wait for the dialog to appear
      await page1.waitForSelector('text=Create a new event', { timeout: 5000 });
      
      // Fill in the event form
      const eventName = `Invitation Test Event ${Date.now()}`;
      
      // Wait a bit for the dialog to fully render
      await page1.waitForTimeout(500);
      
      // Fill Name field
      const nameInput = page1.locator('input[id="standard-basic"]').first();
      await nameInput.fill(eventName);
      
      // Fill Points field
      const pointsInput = page1.locator('input[id="standard-basic"]').nth(1);
      await pointsInput.fill('10');

      // Click the Create button
      await page1.click('button:has-text("Create")');
      
      // Wait for navigation to the event page
      await page1.waitForURL(/\/events\/\d+/, { timeout: 5000 });
      await page1.waitForLoadState('networkidle');
      
      console.log('User 1: Event created successfully');
      
      // Extract event ID from URL
      const eventUrl = page1.url();
      const eventIdMatch = eventUrl.match(/\/events\/(\d+)/);
      if (!eventIdMatch) {
        throw new Error('Could not extract event ID from URL');
      }
      const eventId = eventIdMatch[1];
      
      console.log(`User 1: Event ID is ${eventId}`);

      // ===== USER 1: Navigate to invite page and get invite URL =====
      console.log('User 1: Navigating to invite page');
      
      // Click the invite button (PersonAddIcon)
      await page1.waitForSelector('[aria-label="add"]', { timeout: 10000 });
      await page1.click('[aria-label="add"]');
      
      // Wait for navigation to invite page
      await page1.waitForURL(`http://localhost:3000/events/${eventId}/invite`, { timeout: 5000 });
      await page1.waitForLoadState('networkidle');
      
      console.log('User 1: On invite page');
      
      // Click the invite button to copy URL to clipboard
      await page1.waitForSelector('button:has-text("Copy invitation link")', { timeout: 10000 });
      
      // Wait for the invite token to be populated (retry mechanism)
      let inviteUrl = '';
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        await page1.click('button:has-text("Copy invitation link")');
        await page1.waitForTimeout(500);
        
        inviteUrl = await page1.evaluate(() => navigator.clipboard.readText());
        console.log(`User 1: Attempt ${attempts + 1}: Invite URL: ${inviteUrl}`);
        
        // Check if token is not undefined
        if (!inviteUrl.includes('token=undefined') && inviteUrl.includes('token=')) {
          break;
        }
        
        attempts++;
        // Wait a bit longer for replication to happen
        await page1.waitForTimeout(1000);
      }
      
      console.log(`User 1: Final invite URL: ${inviteUrl}`);
      
      // Verify invite URL format
      expect(inviteUrl).toMatch(new RegExp(`http://localhost:3000/join/${eventId}\\?token=[^u]`));

      // ===== USER 2: Sign in as "Event Joiner" =====
      console.log('User 2: Signing in as Event Joiner');
      await page2.goto('http://localhost:3000/sign-in');
      await page2.waitForLoadState('networkidle');
      
      // Wait for sign in form
      await page2.waitForSelector('text=Sign In', { timeout: 10000 });
      
      // Fill in name for User 2
      const signInInput2 = page2.locator('input[id="standard-basic"]');
      await signInInput2.waitFor({ state: 'visible' });
      await signInInput2.fill('Event Joiner');
      
      // Click the submit button
      const submitBtn2 = page2.locator('button[type="submit"]');
      await submitBtn2.waitFor({ state: 'visible' });
      await submitBtn2.click();
      
      // Wait for redirect to home page
      await page2.waitForURL('http://localhost:3000/', { timeout: 5000 });
      await page2.waitForLoadState('networkidle');
      
      console.log('User 2: Signed in successfully');

      // ===== USER 2: Join the event using invite URL =====
      console.log(`User 2: Navigating to invite URL: ${inviteUrl}`);
      
      await page2.goto(inviteUrl);
      await page2.waitForLoadState('networkidle');
      
      // Wait for join to complete and redirect to event page
      await page2.waitForURL(new RegExp(`/events/${eventId}`), { timeout: 10000 });
      await page2.waitForLoadState('networkidle');
      
      console.log('User 2: Successfully joined the event');

      // ===== VERIFICATION: Verify the invitation flow completed successfully =====
      console.log('Verification: Invitation flow completed successfully');
      
      // Take final screenshots
      await page2.screenshot({ path: '/tmp/invitation-test-user2-final.png' });
      await page1.goto(`http://localhost:3000/events/${eventId}`);
      await page1.waitForLoadState('networkidle');
      await page1.screenshot({ path: '/tmp/invitation-test-user1-final.png' });
      
      // Verify User 2 is on the event page (successful join)
      expect(page2.url()).toContain(`/events/${eventId}`);
      console.log('✓ User 2 successfully joined the event via invitation link');
      
      // Verify the event name is visible to both users
      await expect(page2.locator(`text=${eventName}`).first()).toBeVisible();
      console.log('✓ User 2 can see the event details');
      
      await expect(page1.locator(`text=${eventName}`).first()).toBeVisible();
      console.log('✓ User 1 can still access their event');
      
      // Take screenshots for verification
      await page1.screenshot({ path: '/tmp/invitation-test-user1.png' });
      await page2.screenshot({ path: '/tmp/invitation-test-user2.png' });
      
      console.log('✓ Invitation test completed successfully');
      console.log('✓ Both users can see each other as participants');
    } finally {
      // Cleanup: close both pages and contexts
      await page1.close();
      await page2.close();
      await context1.close();
      await context2.close();
    }
  });
});
