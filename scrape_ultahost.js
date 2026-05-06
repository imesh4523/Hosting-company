const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log("Launching browser... Please wait.");
    // Launch in non-headless mode so the user can interact
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    console.log("Navigating to UltaHost payment methods page...");
    await page.goto('https://bill.ultahost.com/account/paymentmethods/add', { waitUntil: 'networkidle2' });

    console.log("\n=======================================================");
    console.log("🔴 ACTION REQUIRED:");
    console.log("Please log in to your UltaHost account in the browser that just opened.");
    console.log("Navigate to the 'Add New Payment Method' page if it didn't redirect automatically.");
    console.log("You have 60 seconds to do this...");
    console.log("=======================================================\n");

    // Wait 60 seconds for the user to log in and page to load
    for(let i=60; i>0; i--) {
        process.stdout.write(`Time remaining: ${i} seconds...\r`);
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log("\nTime's up! Attempting to capture the page UI...");

    try {
        // Extract the main content of the page
        const pageHTML = await page.evaluate(() => {
            // Get the full HTML
            return document.documentElement.outerHTML;
        });

        fs.writeFileSync('original_payment_methods.html', pageHTML);
        console.log("✅ Successfully downloaded original UI to: original_payment_methods.html");
    } catch (error) {
        console.error("❌ Failed to capture page:", error.message);
    }

    console.log("Closing browser...");
    await browser.close();
})();
