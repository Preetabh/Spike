import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 },
    { duration: "30s", target: 100 },
    { duration: "30s", target: 200 },
    { duration: "30s", target: 0 },
  ],
};

export default function () {
  const payload = JSON.stringify({
    email: "vishubbkup@gmail.com",
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post(
    "http://localhost:5001/api/v1/users/login",
    payload,
    params
  );

  check(res, {
    "Status is 200": (r) => r.status === 200,
    "Response time < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1);
}
