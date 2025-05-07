// Example controller methods
const getExample = async (req, res) => {
  try {
    // This would typically call a service
    res.json({ message: 'Example controller response' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getExample
}; 