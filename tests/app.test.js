import request from "supertest";
import app from "../server.js"

describe("App bootstrapping", () => {
  it("should load landing page", async () => {
    const res = await request(app).get("/");

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain("Login"); // or any text in loginRegister.ejs
  });
});
