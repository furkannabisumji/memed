const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhookController");
const tenderlySignatureMiddleware = require("../middleware/tenderly");
router.get("/tenderly", webhookController.tenderlyWebhookGet);

router.post("/tenderly", webhookController.tenderlyWebhook);

module.exports = router;