const express = require('express');
const url = require('url');
const qs = require('qs');
const request = require('sync-request');
const randomstring = require('randomstring');

const app = express();
app.set('view engine', 'ejs');

// OAuth Client Configuration
const client = {
  client_id: 'oauth-client-1',
  client_secret: 'oauth-client-secret-1',
  redirect_uris: ['http://localhost:9000/callback']
};

// Authorization Server endpoints
const authServer = {
  authorizationEndpoint: 'http://localhost:9001/authorize',
  tokenEndpoint: 'http://localhost:9001/token'
};

// Protected resource server
const protectedResource = 'http://localhost:9002/resource';

// Store tokens
let access_token = null;
let refresh_token = null;
let state = null;

// Utility: Build URL with query parameters
const buildUrl = function(base, options, hash) {
  const newUrl = url.parse(base, true);
  delete newUrl.search;
  if (!newUrl.query) {
    newUrl.query = {};
  }
  Object.keys(options).forEach(key => {
    newUrl.query[key] = options[key];
  });
  if (hash) {
    newUrl.hash = hash;
  }
  return url.format(newUrl);
};

// Encode client credentials for HTTP Basic Auth
const encodeClientCredentials = function(clientId, clientSecret) {
  return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
};

// Home page
app.get('/', function(req, res) {
  res.render('index', { 
    access_token: access_token,
    refresh_token: refresh_token 
  });
});

// Authorize route - Step 1: Redirect to authorization server
app.get('/authorize', function(req, res) {
  // Generate state for CSRF protection
  state = randomstring.generate();

  const authorizeUrl = buildUrl(authServer.authorizationEndpoint, {
    response_type: 'code',
    client_id: client.client_id,
    redirect_uri: client.redirect_uris[0],
    state: state
  });

  res.redirect(authorizeUrl);
});

// Callback route - Step 2: Handle authorization response
app.get('/callback', function(req, res) {
  // Validate state
  if (req.query.state !== state) {
    res.render('error', { error: 'State value did not match' });
    return;
  }

  const code = req.query.code;
  if (!code) {
    res.render('error', { error: 'No code received' });
    return;
  }

  // Prepare form data for token exchange
  const form_data = qs.stringify({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: client.redirect_uris[0]
  });

  // Prepare headers with client authentication
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + encodeClientCredentials(
      client.client_id,
      client.client_secret
    )
  };

  // Exchange code for token (backend channel)
  try {
    const tokRes = request('POST', authServer.tokenEndpoint, {
      body: form_data,
      headers: headers
    });

    const body = JSON.parse(tokRes.getBody());
    access_token = body.access_token;

    // Save refresh_token if provided
    if (body.refresh_token) {
      refresh_token = body.refresh_token;
    }

    res.render('index', { 
      access_token: access_token,
      refresh_token: refresh_token 
    });
  } catch (error) {
    res.render('error', { error: 'Failed to exchange token: ' + error.message });
  }
});

// Fetch protected resource
app.get('/fetch_resource', function(req, res) {
  // Check if we have an access token
  if (!access_token) {
    res.render('error', { error: 'Missing access token.' });
    return;
  }

  const headers = {
    'Authorization': 'Bearer ' + access_token
  };

  try {
    const resource = request('POST', protectedResource, {
      headers: headers
    });

    if (resource.statusCode >= 200 && resource.statusCode < 300) {
      const body = JSON.parse(resource.getBody());
      res.render('data', { resource: body });
      return;
    } else {
      // Token might be expired, try to refresh
      access_token = null;
      if (refresh_token) {
        refreshAccessToken(req, res);
        return;
      } else {
        res.render('error', { 
          error: 'Could not fetch protected resource. Status: ' + resource.statusCode 
        });
        return;
      }
    }
  } catch (error) {
    res.render('error', { error: 'Request failed: ' + error.message });
  }
});

// Refresh access token
function refreshAccessToken(req, res) {
  const form_data = qs.stringify({
    grant_type: 'refresh_token',
    refresh_token: refresh_token
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': 'Basic ' + encodeClientCredentials(
      client.client_id,
      client.client_secret
    )
  };

  try {
    const tokRes = request('POST', authServer.tokenEndpoint, {
      body: form_data,
      headers: headers
    });

    const body = JSON.parse(tokRes.getBody());

    access_token = body.access_token;

    // Update refresh token if new one provided
    if (body.refresh_token) {
      refresh_token = body.refresh_token;
    }

    res.render('index', { 
      access_token: access_token,
      refresh_token: refresh_token 
    });
  } catch (error) {
    refresh_token = null;
    res.render('error', { error: 'Unable to refresh token.' });
  }
}

const PORT = 9000;
app.listen(PORT, function() {
  console.log(`OAuth Client running on http://localhost:${PORT}`);
});
