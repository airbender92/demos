const express = require('express');
const request = require('sync-request');

const app = express();

// Authorization Server verification endpoint
const authServer = 'http://localhost:9001';

// Sample protected resources
const resources = {
  name: 'Protected Resource Data',
  timestamp: new Date().toISOString(),
  owner: 'user123',
  data: 'This is confidential information that requires OAuth authentication.'
};

// Protected resource endpoint
app.post('/resource', function(req, res) {
  // Extract Bearer token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Invalid authorization scheme' });
    return;
  }

  const token = parts[1];

  // Verify token with authorization server
  try {
    const verifyRes = request('GET', `${authServer}/verify?token=${token}`);
    const verifyBody = JSON.parse(verifyRes.getBody());

    if (!verifyBody.valid) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    // Token is valid, return protected resource
    res.json({
      resource: resources,
      accessed_by: verifyBody.client_id,
      user: verifyBody.user_id,
      accessed_at: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

const PORT = 9002;
app.listen(PORT, function() {
  console.log(`Resource Server running on http://localhost:${PORT}`);
});
