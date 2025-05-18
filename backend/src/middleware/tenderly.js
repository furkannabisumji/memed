const crypto = require('crypto');

function verifyTenderlyWebhook(req, res, next) {
  const signature = req.headers['x-tenderly-signature'];
  const timestamp = req.headers['date'];
  
    // Create a HMAC SHA256 hash using the signing key
    const hmac = crypto.createHmac("sha256", process.env.TENDERLY_SECRET);
   
    // Update the hash with the request body using utf8
    hmac.update(JSON.stringify(req.body), 'utf8');
   
    // Update the hash with the request timestamp
    hmac.update(timestamp);
    const digest = hmac.digest("hex");
    if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
      // Signature is valid, proceed to the next middleware or route handler
      next();
    } else {
      console.error('Webhook signature verification failed');   
      return res.status(400).send('Webhook signature not valid');
    }
}
module.exports = verifyTenderlyWebhook;