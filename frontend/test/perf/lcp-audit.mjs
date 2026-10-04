import { chromium } from "@playwright/test";

async function measureLcpAndCWV(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Inject observer before navigation
  await page.addInitScript(() => {
    window.__cwv = { lcp: 0, lcpElement: "", fcp: 0 };
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        window.__cwv.lcp = lastEntry.startTime;
        window.__cwv.lcpElement = lastEntry.element?.tagName || lastEntry.id || "text";
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });

    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          window.__cwv.fcp = entry.startTime;
        }
      }
    }).observe({ type: "paint", buffered: true });
  });

  const response = await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000); // Wait for final LCP candidates

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    return {
      ttfb: nav ? nav.responseStart - nav.requestStart : 0,
      domContentLoaded: nav ? nav.domContentLoadedEventEnd : 0,
      loadTime: nav ? nav.loadEventEnd : 0,
      fcp: window.__cwv?.fcp || 0,
      lcp: window.__cwv?.lcp || 0,
      lcpElement: window.__cwv?.lcpElement || "unknown",
    };
  });

  await browser.close();
  return metrics;
}

async function main() {
  console.log("=== CORE WEB VITALS & LCP AUDIT ===");
  
  const pagesToTest = [
    { name: "Home Page", url: "http://localhost:3000/" },
    { name: "Tool: Base64 Converter", url: "http://localhost:3000/tools/base64-string-converter" },
    { name: "Tool: Color Converter", url: "http://localhost:3000/tools/color-converter" },
  ];

  for (const p of pagesToTest) {
    const res = await measureLcpAndCWV(p.url);
    console.log(`\nPage: ${p.name} (${p.url})`);
    console.log(`- TTFB:                ${res.ttfb.toFixed(1)} ms`);
    console.log(`- FCP:                 ${res.fcp.toFixed(1)} ms`);
    console.log(`- LCP:                 ${res.lcp.toFixed(1)} ms [${res.lcp <= 2500 ? "GOOD <= 2.5s" : "NEEDS IMPROVEMENT"}]`);
    console.log(`- LCP Element:         <${res.lcpElement}>`);
    console.log(`- DOM Content Loaded:  ${res.domContentLoaded.toFixed(1)} ms`);
    console.log(`- Full Load:           ${res.loadTime.toFixed(1)} ms`);
  }
}

main().catch(console.error);
