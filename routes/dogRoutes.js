const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const { registerDog, adoptDog, removeDog, listRegisteredDogs, listAdoptedDogs } = require("../controllers/dogController");

const router = express.Router();

router.use(authenticate);

router.post("/", registerDog);
router.post("/:id/adopt", adoptDog);
router.delete("/:id", removeDog);
router.get("/", listRegisteredDogs);
router.get("/adopted", listAdoptedDogs);

module.exports = router;
