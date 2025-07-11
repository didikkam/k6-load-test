import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    laravel_rps_test: {
      executor: 'ramping-arrival-rate',
      startRate: 10,                  // mulai dari 10 RPS
      timeUnit: '1s',                 
      preAllocatedVUs: 100,           
      maxVUs: 2000,                   
      stages: [
        { duration: '30s', target: 10 },     // 10 RPS - baseline
        { duration: '30s', target: 25 },     // 25 RPS
        { duration: '30s', target: 50 },     // 50 RPS
        { duration: '30s', target: 75 },     // 75 RPS
        { duration: '30s', target: 100 },    // 100 RPS
        { duration: '30s', target: 150 },    // 150 RPS
        { duration: '30s', target: 200 },    // 200 RPS
        { duration: '30s', target: 300 },    // 300 RPS
        { duration: '30s', target: 400 },    // 400 RPS
        { duration: '30s', target: 500 },    // 500 RPS
        { duration: '30s', target: 0 },      // ramp-down
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% request < 3 detik
    http_req_failed:   ['rate<0.05'],  // error rate < 5%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost';
const ENDPOINT = __ENV.ENDPOINT || '/';

export default function () {
  const res = http.get(`${BASE_URL}${ENDPOINT}`);

  // Check untuk response time < 3 detik (dianggap normal)
  check(res, {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
    'response time < 3s': (r) => r.timings.duration < 3000,
    'response time < 1s': (r) => r.timings.duration < 1000,
  });
}

// Analisis kapasitas berdasarkan response time
export function handleSummary(data) {
  const summary = {
    max_vus: data.metrics.vus_max.values.max,
    total_requests: data.metrics.http_reqs.values.count,
    avg_response_time: data.metrics.http_req_duration.values.avg,
    p95_response_time: data.metrics.http_req_duration.values['p(95)'],
    p90_response_time: data.metrics.http_req_duration.values['p(90)'],
    error_rate: data.metrics.http_req_failed.values.rate,
    http_reqs_per_sec: data.metrics.http_reqs.values.rate,
  };

  // Hitung estimasi concurrent users berdasarkan RPS
  const calculateConcurrentUsers = (rps, requestInterval) => {
    return Math.floor(rps * requestInterval);
  };

  // Analisis kapasitas optimal
  console.log('\n=== LARAVEL RPS CAPACITY ANALYSIS ===');
  console.log(`Base URL          : ${BASE_URL}`);
  console.log(`Endpoint          : ${ENDPOINT}`);
  console.log(`Total Requests    : ${summary.total_requests.toLocaleString()}`);
  console.log(`Avg RPS           : ${summary.http_reqs_per_sec.toFixed(1)}`);
  console.log(`Avg Response Time : ${summary.avg_response_time.toFixed(0)} ms`);
  console.log(`P90 Response Time : ${summary.p90_response_time.toFixed(0)} ms`);
  console.log(`P95 Response Time : ${summary.p95_response_time.toFixed(0)} ms`);
  console.log(`Error Rate        : ${(summary.error_rate * 100).toFixed(2)} %`);
  
  // Analisis kapasitas berdasarkan response time
  console.log('\n=== CAPACITY BREAKDOWN ===');
  
  let optimalRps = summary.http_reqs_per_sec;
  let capacityGrade = 'POOR';
  
  if (summary.p95_response_time < 1000) {
    console.log('🚀 EXCELLENT: P95 < 1 detik');
    optimalRps = Math.floor(summary.http_reqs_per_sec * 1.2);
    capacityGrade = 'EXCELLENT';
  } else if (summary.p95_response_time < 2000) {
    console.log('✅ VERY GOOD: P95 < 2 detik');
    optimalRps = Math.floor(summary.http_reqs_per_sec * 1.1);
    capacityGrade = 'VERY_GOOD';
  } else if (summary.p95_response_time < 3000) {
    console.log('✅ GOOD: P95 < 3 detik');
    optimalRps = Math.floor(summary.http_reqs_per_sec);
    capacityGrade = 'GOOD';
  } else if (summary.p95_response_time < 5000) {
    console.log('⚠️ ACCEPTABLE: P95 < 5 detik');
    optimalRps = Math.floor(summary.http_reqs_per_sec * 0.8);
    capacityGrade = 'ACCEPTABLE';
  } else {
    console.log('❌ POOR: P95 > 5 detik');
    optimalRps = Math.floor(summary.http_reqs_per_sec * 0.5);
    capacityGrade = 'POOR';
  }
  
  console.log(`   Optimal RPS: ${optimalRps}`);

  // Analisis Concurrent Users
  console.log('\n=== CONCURRENT USERS ANALYSIS ===');
  console.log(`Optimal RPS: ${optimalRps}`);
  console.log(`Response Time: ${summary.p95_response_time.toFixed(0)}ms`);
  
  // Estimasi concurrent users berdasarkan pola user
  const activeUsers = calculateConcurrentUsers(optimalRps, 10);    // Request setiap 10 detik
  const normalUsers = calculateConcurrentUsers(optimalRps, 30);    // Request setiap 30 detik  
  const lightUsers = calculateConcurrentUsers(optimalRps, 60);     // Request setiap 60 detik
  const heavyUsers = calculateConcurrentUsers(optimalRps, 5);      // Request setiap 5 detik
  
  console.log('\n📊 Concurrent Users Capacity:');
  console.log(`   Heavy Users (5s interval)  : ${heavyUsers.toLocaleString()} users`);
  console.log(`   Active Users (10s interval): ${activeUsers.toLocaleString()} users`);
  console.log(`   Normal Users (30s interval): ${normalUsers.toLocaleString()} users`);
  console.log(`   Light Users (60s interval) : ${lightUsers.toLocaleString()} users`);
  
  // Rekomendasi berdasarkan response time
  console.log('\n🎯 Production Recommendations:');
  if (summary.p95_response_time < 3000) {
    console.log('✅ Ready for production with good performance');
    console.log(`   Recommended: ${normalUsers.toLocaleString()} concurrent users`);
  } else if (summary.p95_response_time < 5000) {
    console.log('⚠️ Acceptable for production but needs monitoring');
    console.log(`   Recommended: ${Math.floor(normalUsers * 0.8).toLocaleString()} concurrent users`);
  } else {
    console.log('❌ Not ready for production - needs optimization');
    console.log(`   Recommended: ${Math.floor(normalUsers * 0.5).toLocaleString()} concurrent users`);
  }

  // Rekomendasi berdasarkan error rate
  console.log('\n=== RECOMMENDATIONS ===');
  if (summary.error_rate < 0.01) {
    console.log('✅ Sistem stabil, bisa handle beban tinggi');
  } else if (summary.error_rate < 0.05) {
    console.log('⚠️ Sistem mulai tertekan, monitor response time');
  } else {
    console.log('❌ Sistem overload, perlu optimasi');
  }

  console.log('\nRingkasan detail tersimpan di rps-capacity-analysis.json');

  return {
    'rps-capacity-analysis.json': JSON.stringify({
      max_vus: summary.max_vus,
      total_requests: summary.total_requests,
      avg_response_time: summary.avg_response_time,
      p95_response_time: summary.p95_response_time,
      p90_response_time: summary.p90_response_time,
      error_rate: summary.error_rate,
      http_reqs_per_sec: summary.http_reqs_per_sec,
      capacity_grade: capacityGrade,
      optimal_rps: optimalRps,
      concurrent_users: {
        heavy_users: heavyUsers,
        active_users: activeUsers,
        normal_users: normalUsers,
        light_users: lightUsers
      },
      production_ready: summary.p95_response_time < 3000,
      recommended_users: summary.p95_response_time < 3000 ? normalUsers :
                        summary.p95_response_time < 5000 ? Math.floor(normalUsers * 0.8) :
                        Math.floor(normalUsers * 0.5)
    }, null, 2),
  };
}

// k6 run --env BASE_URL=http://localhost:8556 --env ENDPOINT=/index-api k6-tests/load-test.js
// k6 run --env BASE_URL=http://localhost:3000 --env ENDPOINT=/api/home k6-tests/load-test.js