const axios = require('axios');

const BASE_URL = process.env.DELHIVERY_BASE_URL || 'https://staging-express.delhivery.com';
const API_TOKEN = process.env.DELHIVERY_API_TOKEN;
const ORIGIN_PIN = process.env.ORIGIN_PINCODE || '263139';
const DEFAULT_WEIGHT = parseInt(process.env.DEFAULT_PRODUCT_WEIGHT_GRAMS, 10) || 500;

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Authorization: `Token ${API_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

const isConfigured = () => Boolean(API_TOKEN);

const calculateCharges = async ({ destinationPin, weightGrams }) => {
  if (!isConfigured()) {
    throw new Error('Delhivery API token not configured');
  }

  const weight = weightGrams || DEFAULT_WEIGHT;

  const { data } = await client.get('/api/kinko/v1/invoice/charges/.json', {
    params: {
      md: 'S',
      cgm: weight,
      o_pin: ORIGIN_PIN,
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

  const payload = `format=json&data=${JSON.stringify({
    shipments: [shipmentData],
    pickup_location: { pin: ORIGIN_PIN },
  })}`;

  const { data } = await client.post('/api/cmu/create.json', payload, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  return data;
};

const trackShipment = async (waybill) => {
  if (!isConfigured()) {
    throw new Error('Delhivery API token not configured');
  }

  const { data } = await client.get('/api/v1/packages/json/', {
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
