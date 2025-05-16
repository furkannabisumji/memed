const crypto = require('crypto');

function verifyTenderlyWebhook(req, res, next) {
  const signature = req.headers['x-tenderly-signature'];
  const timestamp = req.headers['date'];
  console.log({signature, timestamp});
  const rawBody = req.body.toString('utf8');

    if (!signature || !timestamp || !rawBody) {
      return res.status(400).send('Missing signature, timestamp, or body');
    }

    const signedPayload = timestamp + rawBody;
    const hmac = crypto.createHmac('sha256', process.env.TENDERLY_SECRET);
    hmac.update(signedPayload);
    const expectedSignature = hmac.digest('hex');

    if (signature === expectedSignature) {
      // Signature is valid, proceed to the next middleware or route handler
      next();
    } else {
        console.log({signature, expectedSignature});    
      console.error('Webhook signature verification failed');   
      return res.status(400).send('Webhook signature not valid');
    }
}

module.exports = verifyTenderlyWebhook;