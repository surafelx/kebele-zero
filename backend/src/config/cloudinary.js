const cloudinary = require('cloudinary').v2;
const { cloudinary: cfg } = require('./env');

let configured = false;

if (cfg.cloudName && cfg.apiKey && cfg.apiSecret) {
  cloudinary.config({
    cloud_name: cfg.cloudName,
    api_key: cfg.apiKey,
    api_secret: cfg.apiSecret,
    secure: true,
  });
  configured = true;
} else if (process.env.NODE_ENV !== 'test') {
  console.warn(
    '[cloudinary] CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET not set — ' +
    'delete operations will be disabled.'
  );
}

module.exports = { cloudinary, isConfigured: () => configured };
