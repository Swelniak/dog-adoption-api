const Dog = require("../models/Dog");
const mongoose = require("mongoose");

const registerDog = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res
        .status(400)
        .json({ error: "Name and description are required" });
    }

    const dog = await Dog.create({ name, description, owner: req.userId });

    res.status(201).json({ message: "Dog registered successfully", dog });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

const adoptDog = async (req, res) => {
  try {
    const dogId = req.params.id;
    const { thankYouMessage } = req.body;

    if (!mongoose.isValidObjectId(dogId)) {
      return res.status(400).json({ error: "Invalid dog ID" });
    }

    const dog = await Dog.findById(dogId);
    if (!dog) {
      return res.status(404).json({ error: "Dog not found" });
    }

    if (dog.owner.toString() === req.userId) {
      return res
        .status(403)
        .json({ error: "You cannot adopt a dog you registered" });
    }

    if (dog.status === "adopted") {
      return res
        .status(409)
        .json({ error: "This dog has already been adopted" });
    }

    dog.status = "adopted";
    dog.adoptedBy = req.userId;
    dog.thankYouMessage = thankYouMessage || "";
    await dog.save();

    res.status(200).json({ message: "Dog adopted successfully", dog });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

const removeDog = async (req, res) => {
  try {
    const dogId = req.params.id;

    if (!mongoose.isValidObjectId(dogId)) {
      return res.status(400).json({ error: "Invalid dog ID" });
    }

    const dog = await Dog.findById(dogId);
    if (!dog) {
      return res.status(404).json({ error: "Dog not found" });
    }

    if (dog.owner.toString() !== req.userId) {
      return res
        .status(403)
        .json({ error: "You can only remove dogs you registered" });
    }

    if (dog.status === "adopted") {
      return res.status(409).json({ error: "Adopted dogs cannot be removed" });
    }

    await dog.deleteOne();

    res.status(200).json({ message: "Dog removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

const listRegisteredDogs = async (req, res) => {
  try {
    const { status } = req.query;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
    const filter = { owner: req.userId };

    if (status) {
      if (!["available", "adopted"].includes(status)) {
        return res
          .status(400)
          .json({ error: 'Status must be "available" or "adopted"' });
      }
      filter.status = status;
    }

    const totalDogs = await Dog.countDocuments(filter);

    const dogs = await Dog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      dogs,
      pagination: {
        page,
        limit,
        totalDogs,
        totalPages: Math.ceil(totalDogs / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

const listAdoptedDogs = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);

    const filter = { adoptedBy: req.userId };

    const totalDogs = await Dog.countDocuments(filter);

    const dogs = await Dog.find(filter)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      dogs,
      pagination: {
        page,
        limit,
        totalDogs,
        totalPages: Math.ceil(totalDogs / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  registerDog,
  adoptDog,
  removeDog,
  listRegisteredDogs,
  listAdoptedDogs,
};
