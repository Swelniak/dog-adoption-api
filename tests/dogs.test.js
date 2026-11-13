const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
const User = require("../models/User");
const Dog = require("../models/Dog");

chai.use(chaiHttp);
const { expect } = chai;

describe("Dogs API", () => {
  let ownerToken;
  let adopterToken;
  let dogId;

  //Registers a user, logs them in, and returns a token
  const createUserAndLogin = async (username) => {
    const credentials = { username, password: "secret123" };
    await chai.request(app).post("/api/auth/register").send(credentials);
    const res = await chai
      .request(app)
      .post("/api/auth/login")
      .send(credentials);
    return res.body.token;
  };

  before(async () => {
    if (process.env.NODE_ENV !== "test") {
      throw new Error("Tests must run with NODE_ENV=test");
    }
    await User.deleteMany({});
    await Dog.deleteMany({});

    ownerToken = await createUserAndLogin("owner");
    adopterToken = await createUserAndLogin("adopter");
  });

  describe("POST /api/dogs", () => {
    it("registers a dog for an authenticated user", async () => {
      const res = await chai
        .request(app)
        .post("/api/dogs")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "Rex", description: "Friendly lab" });

      expect(res).to.have.status(201);
      expect(res.body.dog.status).to.equal("available");

      // Save the ID so later tests can adopt and remove this dog
      dogId = res.body.dog._id;
    });

    it("rejects a request with no token", async () => {
      const res = await chai
        .request(app)
        .post("/api/dogs")
        .send({ name: "Rex", description: "Friendly lab" });

      expect(res).to.have.status(401);
    });
  });

  describe("POST /api/dogs/:id/adopt", () => {
    it("Stops owners adopting their own dog", async () => {
      const res = await chai
        .request(app)
        .post(`/api/dogs/${dogId}/adopt`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ thankYouMessage: "Thanks!" });

      expect(res).to.have.status(403);
    });

    it("Lets another user adopt the dog", async () => {
      const res = await chai
        .request(app)
        .post(`/api/dogs/${dogId}/adopt`)
        .set("Authorization", `Bearer ${adopterToken}`)
        .send({ thankYouMessage: "Thanks!" });

      expect(res).to.have.status(200);
    });

    it("Rejects adopting a dog that is already adopted", async () => {
      const res = await chai
        .request(app)
        .post(`/api/dogs/${dogId}/adopt`)
        .set("Authorization", `Bearer ${adopterToken}`)
        .send({ thankYouMessage: "Thanks!" });

      expect(res).to.have.status(409);
    });
  });

  describe("DELETE /api/dogs/:id", () => {
    it("Stops owners removing an adopted dog", async () => {
      const res = await chai
        .request(app)
        .delete(`/api/dogs/${dogId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res).to.have.status(409);
    });
  });

  describe("GET /api/dogs", () => {
    it("Lists the dogs the user registered", async () => {
      const res = await chai
        .request(app)
        .get("/api/dogs")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res).to.have.status(200);
      expect(res.body.dogs).to.have.lengthOf(1);
      expect(res.body.pagination.totalDogs).to.equal(1);
    });
  });

  describe("GET /api/dogs/adopted", () => {
    it("Lists the dogs the user adopted", async () => {
      const res = await chai
        .request(app)
        .get("/api/dogs/adopted")
        .set("Authorization", `Bearer ${adopterToken}`);

      expect(res).to.have.status(200);
      expect(res.body.dogs).to.have.lengthOf(1);
      expect(res.body.pagination.totalDogs).to.equal(1);
    });
  });
});
