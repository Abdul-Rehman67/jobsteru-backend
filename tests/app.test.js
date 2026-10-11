import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { stripDangerousKeys } from "../src/middleware/sanitize.js";

const app = createApp({ redis: null });

describe("API foundation", () => {
  it("returns the standard not-found envelope", async () => {
    const response = await request(app).get("/api/v1/missing");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("NOT_FOUND");
    expect(response.headers["x-request-id"]).toBeTruthy();
  });

  it("reports process health without a database connection", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.service).toBe("jobsteru-api");
    expect(response.body.data.checks.mongodb).toBe("down");
    expect(response.body.data.checks.redis).toBe("disabled");
    expect(response.body.data.status).toBe("degraded");
  });

  it("refuses readiness when MongoDB is down", async () => {
    const response = await request(app).get("/api/v1/health/ready");

    expect(response.status).toBe(503);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("NOT_READY");
  });

  it("removes Mongo operators from JSON bodies", async () => {
    const body = {
      email: "aisha@diu.ac.ae",
      $where: "this.password",
      profile: { "name.last": "Al Mansoori", city: "Dubai" },
    };

    stripDangerousKeys(body);

    expect(body).toEqual({
      email: "aisha@diu.ac.ae",
      profile: { city: "Dubai" },
    });
  });
});
