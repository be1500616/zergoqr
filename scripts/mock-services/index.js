const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Mock Twilio Service
const twilioApp = express();
twilioApp.use(cors());
twilioApp.use(bodyParser.json());
twilioApp.use(bodyParser.urlencoded({ extended: true }));

// Health check
twilioApp.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'twilio-mock' });
});

// Mock SMS sending
twilioApp.post('/2010-04-01/Accounts/:accountSid/Messages.json', (req, res) => {
  console.log('Mock Twilio SMS:', req.body);
  res.json({
    sid: 'SM' + Math.random().toString(36).substr(2, 32),
    account_sid: req.params.accountSid,
    from: req.body.From,
    to: req.body.To,
    body: req.body.Body,
    status: 'queued',
    date_created: new Date().toISOString(),
    date_sent: null,
    date_updated: new Date().toISOString()
  });
});

// Mock OTP verification
twilioApp.post('/2010-04-01/Accounts/:accountSid/Services/:serviceSid/VerificationCheck', (req, res) => {
  console.log('Mock Twilio OTP Verification:', req.body);
  const isValid = req.body.Code === '123456'; // Mock OTP
  res.json({
    sid: 'VE' + Math.random().toString(36).substr(2, 32),
    service_sid: req.params.serviceSid,
    account_sid: req.params.accountSid,
    to: req.body.To,
    channel: 'sms',
    status: isValid ? 'approved' : 'pending',
    valid: isValid,
    date_created: new Date().toISOString(),
    date_updated: new Date().toISOString()
  });
});

// Mock Razorpay Service
const razorpayApp = express();
razorpayApp.use(cors());
razorpayApp.use(bodyParser.json());

// Health check
razorpayApp.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'razorpay-mock' });
});

// Mock order creation
razorpayApp.post('/v1/orders', (req, res) => {
  console.log('Mock Razorpay Order:', req.body);
  res.json({
    id: 'order_' + Math.random().toString(36).substr(2, 14),
    entity: 'order',
    amount: req.body.amount,
    amount_paid: 0,
    amount_due: req.body.amount,
    currency: req.body.currency || 'INR',
    receipt: req.body.receipt,
    status: 'created',
    attempts: 0,
    notes: req.body.notes || {},
    created_at: Math.floor(Date.now() / 1000)
  });
});

// Mock payment verification
razorpayApp.post('/v1/payments/:paymentId', (req, res) => {
  console.log('Mock Razorpay Payment Verification:', req.params.paymentId);
  res.json({
    id: req.params.paymentId,
    entity: 'payment',
    amount: 50000, // Mock amount
    currency: 'INR',
    status: 'captured',
    order_id: 'order_' + Math.random().toString(36).substr(2, 14),
    method: 'card',
    captured: true,
    created_at: Math.floor(Date.now() / 1000)
  });
});

// Generic Mock Service for other APIs
const genericApp = express();
genericApp.use(cors());
genericApp.use(bodyParser.json());

// Health check
genericApp.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'generic-mock' });
});

// Catch-all mock endpoint
genericApp.all('*', (req, res) => {
  console.log(`Mock API Call: ${req.method} ${req.path}`, req.body);
  res.json({
    success: true,
    method: req.method,
    path: req.path,
    body: req.body,
    timestamp: new Date().toISOString(),
    message: 'Mock response from development environment'
  });
});

// Start services
const TWILIO_PORT = 8080;
const RAZORPAY_PORT = 8081;
const GENERIC_PORT = 8082;

twilioApp.listen(TWILIO_PORT, () => {
  console.log(`Mock Twilio service running on port ${TWILIO_PORT}`);
});

razorpayApp.listen(RAZORPAY_PORT, () => {
  console.log(`Mock Razorpay service running on port ${RAZORPAY_PORT}`);
});

genericApp.listen(GENERIC_PORT, () => {
  console.log(`Mock Generic service running on port ${GENERIC_PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down mock services...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down mock services...');
  process.exit(0);
});
