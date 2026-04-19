const Notice = require("../models/Notice");

exports.createNotice = async (req, res) => {
  try {
    const notice = await Notice.create(req.body);
    res.status(201).json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    res.json(notice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNotice = async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: "Notice deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
