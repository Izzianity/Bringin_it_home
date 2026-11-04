import { beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";

process.env.JWT_SECRET = "x".repeat(32);
process.env.ADMIN_EMAIL = "a@b.co";
process.env.ADMIN_PASSWORD = "password123";

const verifyToken = vi.fn(async (t: string) => {
  if (t !== "good") throw new Error("bad");
  return { uid: "u1", email: "u@x.co", name: "U" } as never;
});
const generator = { generate: vi.fn(async () => "Sunny vibes ☀️") };
const prisma = {
  user: { upsert: vi.fn(async () => ({ id: "1", email: "u@x.co", name: "U", role: "user" })) },
} as never;

let app: import("express").Express;
beforeAll(async () => {
  const { createApp } = await import("./app.js");
  app = createApp({ prisma, verifyToken, generator });
});

describe("app", () => {
  it("health", async () => {
    await request(app).get("/health").expect(200);
  });

  it("rejects missing/invalid tokens", async () => {
    await request(app).post("/ai/caption").send({ description: "x" }).expect(401);
    await request(app)
      .post("/ai/caption")
      .set("Authorization", "Bearer nope")
      .send({ description: "x" })
      .expect(401);
  });

  it("validates input", async () => {
    await request(app)
      .post("/ai/caption")
      .set("Authorization", "Bearer good")
      .send({})
      .expect(400);
  });

  it("generates caption with attribution", async () => {
    const res = await request(app)
      .post("/ai/caption")
      .set("Authorization", "Bearer good")
      .send({ description: "beach" })
      .expect(200);
    expect(res.body.caption).toBe("Sunny vibes ☀️");
    expect(res.body.generatedBy.partner).toBe("gemini");
  });

  it("provisions profile on /me", async () => {
    const res = await request(app).get("/me").set("Authorization", "Bearer good").expect(200);
    expect(res.body.email).toBe("u@x.co");
  });
});
