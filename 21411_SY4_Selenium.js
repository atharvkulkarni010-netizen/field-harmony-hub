const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');

// Test Configuration
const TARGET_URL = 'https://field-harmony-hub.vercel.app'; // Production URL
const TEST_EMAIL = 'krushnadhurve60@gmail.com'; // Change to valid worker email
const TEST_PASSWORD = 'Krushna@123'; // Change to valid password

(async function executeSeleniumTest() {
    let driver = await new Builder().forBrowser('chrome').build();
    
    try {
        console.log("Starting Selenium Test Execution...");
        
        // 1. Navigation: Move to Login Page
        await driver.get(`${TARGET_URL}/login`);
        await driver.manage().window().maximize();
        console.log("Navigated to Login Page.");

        // Synchronization: Implicit wait across the script
        await driver.manage().setTimeouts({ implicit: 5000 });

        // 2. Form Handling: Input Type 1 (Text field)
        let emailField = await driver.wait(until.elementLocated(By.id('email')), 10000);
        let passwordField = await driver.findElement(By.id('password'));
        
        await emailField.sendKeys(TEST_EMAIL);
        await passwordField.sendKeys(TEST_PASSWORD);
        console.log("Entered Text Data (Email & Password).");

        let loginButton = await driver.findElement(By.xpath('//button[@type="submit"]'));
        await loginButton.click();
        
        // Wait for dashboard to load (Navigating to worker module)
        console.log("Waiting for Worker Dashboard to load...");
        try {
            await driver.wait(until.urlContains('/worker'), 10000);
        } catch (e) {
            let currentUrl = await driver.getCurrentUrl();
            console.error('\n!!! LOGIN NAVIGATION FAILED !!!');
            console.error('Expected to land on a URL containing "/worker", but ended up on: ' + currentUrl);
            console.error('If the URL ends in "/admin" or "/manager", this means the account is NOT a Worker account.');
            console.error('If the URL is still "/login", it means the login credentials or server connection failed.');
            console.error('Please assign a Worker account to TEST_EMAIL to complete the check-box test. Exiting...');
            throw e;
        }
        // 3. Navigation: Navigate to Submit Report Page
        console.log("Navigating to Submit Report page...");
        await driver.get(`${TARGET_URL}/worker/report`);
        
        // Form Handling: Input Type 2 (Checkbox)
        console.log("Waiting for checkboxes to load...");
        // Radix UI Checkbox uses a button with role="checkbox"
        let checkbox = await driver.wait(until.elementLocated(By.xpath('//button[@role="checkbox"]')), 5000).catch(e => null);
        if (checkbox) {
            await checkbox.click();
            console.log("Checked option (Checkbox).");
        } else {
            console.log("No assigned tasks found to check, proceeding...");
        }

        let textarea = await driver.wait(until.elementLocated(By.tagName('textarea')), 5000);
        await textarea.sendKeys('Automated test report description submitted by Selenium.');
        console.log("Entered Report Description (Textarea).");

        // Now move to Apply Leave page to cover Dropdown
        console.log("Navigating to Apply Leave page to interact with Dropdown...");
        await driver.get(`${TARGET_URL}/worker/leave`);
        
        // Form Handling: Input Type 3 (Dropdown)
        console.log("Interacting with Dropdown (Select)...");
        let dropdownTrigger = await driver.wait(until.elementLocated(By.xpath('//button[@role="combobox"]')), 5000);
        await dropdownTrigger.click(); // Open dropdown
        
        // Select an option from Radix select
        let option = await driver.wait(until.elementLocated(By.xpath('//div[@role="option"]')), 5000);
        await option.click();
        console.log("Selected option from Dropdown.");

        // Fill leave dates and text
        let dates = await driver.findElements(By.xpath('//input[@type="date"]'));
        if(dates.length >= 2) {
            await dates[0].sendKeys('12-12-2026'); // start date
            await dates[1].sendKeys('13-12-2026'); // end date
        }
        
        let reasonArea = await driver.findElement(By.tagName('textarea'));
        await reasonArea.sendKeys('Test leave request via Selenium Automation.');
        
        // Submit Leave
        let submitLeaveBtn = await driver.findElement(By.xpath('//button[contains(text(), "Apply")] | //button[@type="submit"]'));
        await submitLeaveBtn.click();
        console.log("Clicked Submit Application Button.");

        // 4. Validation: Assert to verify the popup outcome
        console.log("Validating successful outcome popup...");
        let toastElement = await driver.wait(until.elementLocated(By.xpath('//li[@role="status"] | //div[contains(@class, "toast")] | //*[contains(text(), "Success") or contains(text(), "Applied")]')), 10000);
        
        let toastText = await toastElement.getText();
        console.log(`Captured Popup Text: '${toastText}'`);
        
        assert.ok(toastText.length > 0, "Validation Failed: No text found in popup.");
        console.log("ASSERTION PASSED: Successful popup verified!");
        
    } catch (error) {
        console.error("Test failed due to exception:", error);
    } finally {
        console.log("Closing browser.");
        await driver.quit();
    }
})();
