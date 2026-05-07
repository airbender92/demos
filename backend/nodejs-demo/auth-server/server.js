const express = require('express');
const url = require('url');
const qs = require('qs');
const randomstring = require('randomstring');

const app = express();
app.set('view engine', 'ejs');

// Registered OAuth clients
const clients = {
  'oauth-client-1': {
    client_id: 'oauth-client-1',
    client_secret: 'oauth-client-secret-1',
    redirect_uris: ['http://localhost:9000/callback']
  }
};

// Store authorization codes and access tokens
const authCodes = {};
const accessTokens = {};
const refreshTokens = {};

app.get('/authorize', function(req, res) {
  const clientId = req.query.client_id;
  const redirectUri = req.query.redirect_uri;
  const responseType = req.query.response_type;
  const state = req.query.state;

  // Validate client
  if (!clients[clientId]) {
    res.render('error', { error: 'Unknown client' });
    return;
  }

  // Validate redirect_uri matches registered one
  if (!clients[clientId].redirect_uris.includes(redirectUri)) {
    res.render('error', { error: 'Invalid redirect_uri' });
    return;
  }

  // Show consent page
  res.render('authorize', {
    client: clients[clientId],
    redirect_uri: redirectUri,
    response_type: responseType,
    state: state
  });
});

app.post('/authorize/decision', function(req, res) {
  const clientId = req.body.client_id;
  const redirectUri = req.body.redirect_uri;
  const responseType = req.body.response_type;
  const state = req.body.state;
  const approve = req.body.approve;

  if (!approve) {
    res.render('error', { error: 'User denied authorization' });
    return;
  }

  if (responseType === 'code') {
    // Generate authorization code
    const code = randomstring.generate(16);
    
    // Store the code with associated data
    authCodes[code] = {
      client_id: clientId,
      redirect_uri: redirectUri,
      user_id: 'user123'
    };

    // Redirect back to client with code
    const redirectUrl = url.parse(redirectUri, true);
    redirectUrl.query.code = code;
    if (state) {
      redirectUrl.query.state = state;
    }
    delete redirectUrl.search;
    
    res.redirect(url.format(redirectUrl));
  }
});

app.post('/token', function(req, res) {
  const grantType = req.body.grant_type;
  const redirectUri = req.body.redirect_uri;
  const code = req.body.code;
  const refreshToken = req.body.refresh_token;

  // Client authentication via HTTP Basic Auth
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Missing authorization header' });
    return;
  }

  const encoded = authHeader.split(' ')[1];
  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const [clientId, clientSecret] = decoded.split(':');

  if (!clients[clientId] || clients[clientId].client_secret !== clientSecret) {
    res.status(401).json({ error: 'Invalid client credentials' });
    return;
  }

  if (grantType === 'authorization_code') {
    // Validate redirect_uri matches
    if (redirectUri !== clients[clientId].redirect_uris[0]) {
      res.status(400).json({ error: 'Invalid redirect_uri' });
      return;
    }

    // Validate code exists and belongs to this client
    if (!authCodes[code]) {
      res.status(400).json({ error: 'Invalid authorization code' });
      return;
    }

    if (authCodes[code].client_id !== clientId) {
      res.status(400).json({ error: 'Code does not belong to client' });
      return;
    }

    // Delete the code (one-time use)
    delete authCodes[code];

    // Generate tokens
    const accessToken = randomstring.generate(32);
    const refreshToken = randomstring.generate(32);

    // Store tokens
    accessTokens[accessToken] = {
      client_id: clientId,
      user_id: 'user123'
    };

    refreshTokens[refreshToken] = {
      client_id: clientId,
      user_id: 'user123'
    };

    res.json({
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer'
    });

  } else if (grantType === 'refresh_token') {
    // Validate refresh token
    if (!refreshTokens[refreshToken]) {
      res.status(400).json({ error: 'Invalid refresh token' });
      return;
    }

    if (refreshTokens[refreshToken].client_id !== clientId) {
      res.status(400).json({ error: 'Token does not belong to client' });
      return;
    }

    // Generate new access token
    const newAccessToken = randomstring.generate(32);
    
    accessTokens[newAccessToken] = {
      client_id: clientId,
      user_id: 'user123'
    };

    res.json({
      access_token: newAccessToken,
      token_type: 'Bearer',
      refresh_token: refreshToken
    });

  } else {
    res.status(400).json({ error: 'Unsupported grant_type' });
  }
});

app.get('/verify', function(req, res) {
  const token = req.query.token;

  if (accessTokens[token]) {
    res.json({
      valid: true,
      client_id: accessTokens[token].client_id,
      user_id: accessTokens[token].user_id
    });
  } else {
    res.json({ valid: false });
  }
});

const PORT = 9001;
app.listen(PORT, function() {
  console.log(`Authorization Server running on http://localhost:${PORT}`);
});
