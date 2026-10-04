import autocannon from "autocannon";

async function runBenchmark(title, url, connections = 20, duration = 10) {
  console.log(`\n========================================`);
  console.log(`Running Benchmark: ${title}`);
  console.log(`URL: ${url}`);
  console.log(`Concurrency: ${connections} connections | Duration: ${duration}s`);
  console.log(`========================================`);

  return new Promise((resolve, reject) => {
    autocannon(
      {
        url,
        connections,
        duration,
        pipelining: 1,
      },
      (err, results) => {
        if (err) return reject(err);
        
        console.log(`Requests/sec: Average = ${results.requests.average.toFixed(1)}, Max = ${results.requests.max}`);
        console.log(`Latency (ms): p50 = ${results.latency.p50}, p90 = ${results.latency.p90}, p99 = ${results.latency.p99}, Max = ${results.latency.max}`);
        console.log(`Throughput: ${(results.throughput.average / (1024 * 1024)).toFixed(2)} MB/s`);
        console.log(`Total Requests: ${results.requests.total} in ${duration}s`);
        console.log(`2xx Responses: ${results["2xx"]}, Non-2xx Responses: ${results.non2xx}, Timeouts: ${results.timeouts}`);

        resolve({
          title,
          url,
          connections,
          rpsAverage: results.requests.average,
          rpsMax: results.requests.max,
          latencyP50: results.latency.p50,
          latencyP99: results.latency.p99,
          totalRequests: results.requests.total,
          errors: results.errors + results.timeouts,
        });
      }
    );
  });
}

async function main() {
  const summary = [];

  // 1. Frontend Homepage (Static/SSR)
  summary.push(await runBenchmark("Frontend Homepage (Concurrency 20)", "http://localhost:3000/", 20, 10));
  summary.push(await runBenchmark("Frontend Homepage (High Load Concurrency 100)", "http://localhost:3000/", 100, 10));

  // 2. Frontend Tool Route
  summary.push(await runBenchmark("Frontend Tool Page: Base64 Converter", "http://localhost:3000/tools/base64-string-converter", 20, 10));

  // 3. Backend API
  summary.push(await runBenchmark("Backend API: GET /api/tools (Concurrency 20)", "http://localhost:5145/api/tools", 20, 10));
  summary.push(await runBenchmark("Backend API: GET /api/tools (High Load Concurrency 100)", "http://localhost:5145/api/tools", 100, 10));

  console.log("\n=================== BENCHMARK SUMMARY ===================");
  console.table(
    summary.map((s) => ({
      Target: s.title,
      "Connections": s.connections,
      "Avg RPS": Math.round(s.rpsAverage),
      "Max RPS": s.rpsMax,
      "p50 Latency (ms)": s.latencyP50,
      "p99 Latency (ms)": s.latencyP99,
      "Total Req": s.totalRequests,
      "Failures": s.errors,
    }))
  );
}

main().catch(console.error);
