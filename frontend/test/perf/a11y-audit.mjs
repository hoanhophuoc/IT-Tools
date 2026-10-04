import { chromium } from "@playwright/test";

async function auditPageA11y(page, url, pageName) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const auditResults = await page.evaluate(() => {
    const issues = [];

    // 1. html lang attribute
    const htmlLang = document.documentElement.getAttribute("lang");
    if (!htmlLang) {
      issues.push("HTML document missing 'lang' attribute");
    }

    // 2. document title
    if (!document.title || document.title.trim() === "") {
      issues.push("Document is missing a title");
    }

    // 3. Form input labeling
    const inputs = Array.from(document.querySelectorAll("input:not([type='hidden']), textarea, select"));
    let unlabeledInputs = 0;
    inputs.forEach((input) => {
      const hasId = input.id && document.querySelector(`label[for="${input.id}"]`);
      const hasAriaLabel = input.getAttribute("aria-label") || input.getAttribute("aria-labelledby");
      const hasEnclosingLabel = input.closest("label");
      const hasPlaceholder = input.getAttribute("placeholder");
      if (!hasId && !hasAriaLabel && !hasEnclosingLabel && !hasPlaceholder) {
        unlabeledInputs++;
      }
    });
    if (unlabeledInputs > 0) {
      issues.push(`Found ${unlabeledInputs} inputs lacking labeling (id/label, aria-label, or placeholder)`);
    }

    // 4. Button accessible names
    const buttons = Array.from(document.querySelectorAll("button"));
    let namelessButtons = 0;
    buttons.forEach((btn) => {
      const text = btn.innerText?.trim();
      const ariaLabel = btn.getAttribute("aria-label");
      const title = btn.getAttribute("title");
      if (!text && !ariaLabel && !title) {
        namelessButtons++;
      }
    });
    if (namelessButtons > 0) {
      issues.push(`Found ${namelessButtons} buttons lacking accessible names`);
    }

    // 5. Image alt text
    const images = Array.from(document.querySelectorAll("img"));
    let unaltImages = 0;
    images.forEach((img) => {
      const alt = img.getAttribute("alt");
      const role = img.getAttribute("role");
      if (alt === null && role !== "presentation" && role !== "none") {
        unaltImages++;
      }
    });
    if (unaltImages > 0) {
      issues.push(`Found ${unaltImages} images without alt attributes`);
    }

    return {
      title: document.title,
      totalInputs: inputs.length,
      totalButtons: buttons.length,
      totalImages: images.length,
      issues,
    };
  });

  // 6. Keyboard navigation / Tab key focus test
  await page.keyboard.press("Tab");
  const focusedTag = await page.evaluate(() => document.activeElement?.tagName);

  console.log(`\n=== ACCESSIBILITY (a11y) AUDIT: ${pageName} ===`);
  console.log(`URL: ${url}`);
  console.log(`Title: "${auditResults.title}"`);
  console.log(`Audited elements: ${auditResults.totalButtons} buttons, ${auditResults.totalInputs} inputs, ${auditResults.totalImages} images`);
  console.log(`Keyboard Tab navigation active element: <${focusedTag}>`);

  if (auditResults.issues.length === 0) {
    console.log(`STATUS: PASS (0 violations detected)`);
  } else {
    console.log(`STATUS: WARNING (${auditResults.issues.length} potential issues found)`);
    auditResults.issues.forEach((issue) => console.log(`  - ${issue}`));
  }

  return auditResults.issues.length === 0;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const pagesToAudit = [
      { url: "http://localhost:3000/", name: "Home Page" },
      { url: "http://localhost:3000/tools/base64-string-converter", name: "Base64 Converter Tool" },
      { url: "http://localhost:3000/auth", name: "Authentication Page" },
    ];

    let allPassed = true;
    for (const p of pagesToAudit) {
      const passed = await auditPageA11y(page, p.url, p.name);
      if (!passed) allPassed = false;
    }

    console.log("\n=========================================");
    console.log(allPassed ? "OVERALL a11y AUDIT: PASSED" : "OVERALL a11y AUDIT: COMPLETED WITH ADVISORIES");
    console.log("=========================================\n");
  } finally {
    await browser.close();
  }
}

run();
