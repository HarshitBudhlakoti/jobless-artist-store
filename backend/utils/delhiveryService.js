const axios = require('axios');

// Read env vars at runtime (not module load) for Vercel serverless compatibility
const getConfig = () => ({
  baseUrl: process.env.DELHIVERY_BASE_URL || 'https://track.delhivery.com',
  apiToken: process.env.DELHIVERY_API_TOKEN,
  originPin: process.env.ORIGIN_PINCODE || '263139',
  defaultWeight: parseInt(process.env.DEFAULT_PRODUCT_WEIGHT_GRAMS, 10) || 500,
});

const getClient = () => {
  const { baseUrl, apiToken } = getConfig();
  return axios.create({
    baseURL: baseUrl,
    timeout: 15000,
    headers: {
      Authorization: `Token ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });
};

const isConfigured = () => Boolean(process.env.DELHIVERY_API_TOKEN);

const calculateCharges = async ({ destinationPin, weightGrams }) => {
  if (!isConfigured()) {
    throw new Error('Delhivery API token not configured');
  }

  const { originPin, defaultWeight } = getConfig();
  const weight = weightGrams || defaultWeight;

  const { data } = await getClient().get('/api/kinko/v1/invoice/charges/.json', {
    params: {
      md: 'S',
      cgm: weight,
      o_pin: originPin,
      d_pin: destinationPin,
      ss: 'Delivered',
    },
  });

  return data;
};

const createShipment = async (shipmentData) => {
  if (!isConfigured()) {
    throw new Error('Delhivery API token not configured');
  }

  const { originPin } = getConfig();
  const payload = `format=json&data=${JSON.stringify({
    shipments: [shipmentData],
    pickup_location: { pin: originPin },
  })}`;

  const { data } = await getClient().post('/api/cmu/create.json', payload, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return data;
};

const trackShipment = async (waybill) => {
  if (!isConfigured()) {
    throw new Error('Delhivery API token not configured');
  }

  const { data } = await getClient().get('/api/v1/packages/json/', {
    params: { waybill },
  });

  return data;
};

module.exports = {
  isConfigured,
  calculateCharges,
  createShipment,
  trackShipment,
};
