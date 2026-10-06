module.exports = async (req, res) => {
  res.status(200).json({
    success: true,
    service: "PROZPO Backend",
    status: "running"
  });
};
