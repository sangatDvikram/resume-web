/**
 * E10-S5: k6 Load Test — Portfolio CMS API
 *
 * Targets all public GET endpoints with 100 virtual users over 60 seconds.
 * Acceptance criteria: p95 response time <= 200 ms, error rate < 1%.
 *
 * Usage:
 *   k6 run docs/k6-load-test.js
 *   k6 run --env BASE_URL=https://api.example.com docs/k6-load-test.js
 *
 * Install k6: https://k6.io/docs/getting-started/installation/
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ── Custom metrics ─────────────────────────────────────────────────────────────
const errorRate     = new Rate('error_rate');
const resumeDuration  = new Trend('resume_duration',  true);
const blogDuration    = new Trend('blog_duration',    true);
const projectsDuration = new Trend('projects_duration', true);
const galleryDuration = new Trend('gallery_duration', true);

// ── Options ────────────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '10s', target: 25  },  // ramp up to 25 VUs
    { duration: '40s', target: 100 },  // hold at 100 VUs
    { duration: '10s', target: 0   },  // ramp down
  ],
  thresholds: {
    // Overall p95 must be under 200 ms
    http_req_duration: ['p(95)<200'],
    // Error rate must be below 1%
    error_rate: ['rate<0.01'],
    // Per-endpoint thresholds
    resume_duration:   ['p(95)<200'],
    blog_duration:     ['p(95)<200'],
    projects_duration: ['p(95)<200'],
    gallery_duration:  ['p(95)<200'],
  },
};

// ── Configuration ──────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

const HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function get(url, trend) {
  const res = http.get(`${BASE_URL}${url}`, { headers: HEADERS });
  const ok  = check(res, {
    'status is 200': (r) => r.status === 200,
    'response is JSON': (r) => r.headers['Content-Type']?.includes('application/json'),
  });
  errorRate.add(!ok);
  if (trend) trend.add(res.timings.duration);
  return res;
}

// ── Main scenario ──────────────────────────────────────────────────────────────
export default function () {
  // Resume
  get('/api/v1/resume', resumeDuration);
  sleep(0.2);

  // Blog posts list
  get('/api/v1/blog', blogDuration);
  sleep(0.2);

  // Projects list
  get('/api/v1/projects', projectsDuration);
  sleep(0.2);

  // Gallery albums
  get('/api/v1/gallery/albums', galleryDuration);
  sleep(0.2);

  // Simulate reading a blog post (use first post slug if env var is set)
  const blogSlug = __ENV.BLOG_SLUG || 'hello-world';
  get(`/api/v1/blog/${blogSlug}`, blogDuration);
  sleep(0.2);

  // Simulate reading a project (use first project slug if env var is set)
  const projectSlug = __ENV.PROJECT_SLUG || 'portfolio-cms';
  get(`/api/v1/projects/${projectSlug}`, projectsDuration);
  sleep(0.2);
}

// ── Summary output ─────────────────────────────────────────────────────────────
export function handleSummary(data) {
  const p95 = data.metrics.http_req_duration?.values?.['p(95)'];
  const errRate = data.metrics.error_rate?.values?.rate;
  console.log(`\n=== Load Test Summary ===`);
  console.log(`p95 response time: ${p95?.toFixed(1) ?? 'n/a'} ms  (threshold: 200 ms)`);
  console.log(`Error rate:        ${((errRate ?? 0) * 100).toFixed(2)}%  (threshold: 1%)`);
  console.log(`========================\n`);
  return {};
}
