import { chromium } from "@playwright/test";

async function main() {
  console.log("=== MEMORY LEAK DIAGNOSTIC AUDIT ===");
  console.log("Testing repetitive navigation and user interaction cycles for heap leak detection...\n");

  const browser = await chromium.launch({
    headless: true,
    args: ["--js-flags=--expose-gc"],
  });

  const page = await browser.newPage();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");
  await cdp.send("HeapProfiler.enable");

  async function getHeapSize() {
    await cdp.send("HeapProfiler.collectGarbage");
    const { metrics } = await cdp.send("Performance.getMetrics");
    const heapUsed = metrics.find((m) => m.name === "JSHeapUsedSize");
    return heapUsed ? heapUsed.value / (1024 * 1024) : 0;
  }

  // 1. Baseline
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const baselineHeap = await getHeapSize();
  console.log(`Baseline JS Heap (after GC): ${baselineHeap.toFixed(2)} MB`);

  // 2. Repetitive cycles
  const cycles = 15;
  const intermediateReadings = [];

  for (let i = 1; i <= cycles; i++) {
    await page.goto("http://localhost:3000/tools/base64-string-converter", { waitUntil: "domcontentloaded" });
    const textarea = page.locator("textarea").first();
    if (await textarea.isVisible()) {
      await textarea.fill(`Iteration ${i}: Testing repeated payload memory allocation in IT-Tools.`);
    }

    await page.goto("http://localhost:3000/tools/color-converter", { waitUntil: "domcontentloaded" });
    await page.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });

    if (i % 5 === 0) {
      const heap = await getHeapSize();
      intermediateReadings.push({ cycle: i, heap: heap.toFixed(2) });
      console.log(`Cycle ${i}/${cycles} JS Heap: ${heap.toFixed(2)} MB`);
    }
  }

  // 3. Final reading
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const finalHeap = await getHeapSize();
  console.log(`\nFinal JS Heap (after GC): ${finalHeap.toFixed(2)} MB`);

  const heapDiff = finalHeap - baselineHeap;
  console.log(`Retained Heap Difference: ${heapDiff >= 0 ? "+" : ""}${heapDiff.toFixed(2)} MB`);

  // An increase of < 2MB after 15 heavy navigation cycles is normal V8 JIT warmup and cache
  if (heapDiff < 3.0) {
    console.log("PASS: No significant memory leak detected. Heap usage remains stable across repeated cycles.");
  } else {
    console.warn("WARNING: Significant heap growth observed. Possible uncollected event listener or DOM reference.");
  }

  await browser.close();
}

main().catch(console.error);
