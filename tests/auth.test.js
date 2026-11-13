const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
const User = require("../models/User");
const Dog = require("../models/Dog");

chai.use(chaiHttp);
const { expect } = chai;

describe("Auth API", () => {
  // start every test run with an empty test database
  before(async () => {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("Tests must run with NODE_ENV=test");
    }
    await User.deleteMany({});
    await Dog.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("registers a new user", async () => {
      const res = await chai
        .request(app)
        .post("/api/auth/register")
        .send({ username: "alice", password: "secret123" });

      expect(res).to.have.status(201);
      expect(res.body.user.username).to.equal("alice");
      expect(res.body.user).to.not.have.property("password");
    });

    it("rejects a username that is already taken", async () => {
      const res = await chai
        .request(app)
        .post("/api/auth/register")
        .send({ username: "alice", password: "secret123" });

      expect(res).to.have.status(409);
    });

    it("rejects a request with no password", async () => {
      const res = await chai
        .request(app)
        .post("/api/auth/register")
        .send({ username: "bob" });

      expect(res).to.have.status(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("logs in with valid credentials and returns a token", async () => {
      const res = await chai
        .request(app)
        .post("/api/auth/login")
        .send({ username: "alice", password: "secret123" });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("token");
    });

    it("rejects a wrong password", async () => {
      const res = await chai
        .request(app)
        .post("/api/auth/login")
        .send({ username: "alice", password: "wrongpassword" });

      expect(res).to.have.status(401);
    });

    it("rejects a username that does not exist", async () => {
      const res = await chai
        .request(app)
        .post("/api/auth/login")
        .send({ username: "charlie", password: "secret123" });

      expect(res).to.have.status(401);
    });
  });
});
