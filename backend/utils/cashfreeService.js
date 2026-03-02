const axios = require('axios');
const crypto = require('crypto');

// Read env vars at runtime (not module load) for Vercel serverless compatibility
const getConfig = () => ({
  appId: process.env.CASHFREE_APP_ID,
  secretKey: process.env.CASHFREE_SECRET_KEY,
  env: process.env.CASHFREE_ENV || 'sandbox',
});

const getBaseUrl = () => {
  const { env } = getConfig();
  return env === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
};

const getClient = () => {
  const { appId, secretKey } = getConfig();
  return axios.create({
    baseURL: getBaseUrl(),
    timeout: 15000,
    headers: {
      'x-client-id': appId,
      'x-client-secret': secretKey,
      'x-api-version': '2023-08-01',
      'Content-Type': 'application/json',
    },
  });
};

const isConfigured = () =>
  Boolean(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);

const createOrder = async ({ orderId, orderAmount, customerDetails }) => {
  if (!isConfigured()) {
    throw new Error('Cashfree credentials not configured');
  }

  const { data } = await getClient().post('/orders', {
    order_id: orderId,
    order_amount: orderAmount,
    order_currency: 'INR',
    customer_details: {
      customer_id: customerDetails.customerId,
      customer_name: customerDetails.customerName,
      customer_email: customerDetails.customerEmail,
      customer_phone: customerDetails.customerPhone,
    },
    order_meta: {
      return_url: customerDetails.returnUrl,
    },
  });

  return data;
};

const getOrderStatus = async (orderId) => {
  if (!isConfigured()) {
    throw new Error('Cashfree credentials not configured');
  }

  const { data } = await getClient().get(`/orders/${orderId}`);
  return data;
};

const verifyWebhookSignature = (rawBody, timestamp, signature) => {
  const { secretKey } = getConfig();
  const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
  const payload = timestamp + body;
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('base64');
  return expectedSignature === signature;
};

module.exports = {
  isConfigured,
  createOrder,
  getOrderStatus,
  verifyWebhookSignature,
};
