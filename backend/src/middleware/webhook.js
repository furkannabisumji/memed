const verifyWebhook = (req, res, next) => {
    const signature = req.headers['x-webhook-signature'];
    if(signature === process.env.WEBHOOK_SECRET) {
      next();
    } else {
      console.error('Webhook signature verification failed');   
      return res.status(400).send('Webhook signature not valid');
    }
}
module.exports = verifyWebhook;