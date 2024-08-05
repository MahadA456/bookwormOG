import express from 'express';
import bodyParser from 'body-parser';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

const users = {}; // In-memory store for users and their credentials

app.post('/generate-registration-options', (req, res) => {
  const { email } = req.body;
  const user = users[email] || { email, id: email, credentials: [] };

  const options = generateRegistrationOptions({
    rpName: 'Book Worm',
    rpID: 'localhost',
    userID: user.id,
    userName: user.email,
    attestationType: 'direct',
  });

  users[email] = user;
  users[email].currentChallenge = options.challenge;

  res.json(options);
});

app.post('/verify-registration', async (req, res) => {
  const { email, attResp } = req.body;
  const user = users[email];

  if (!user) {
    return res.status(400).json({ success: false, message: 'User not found' });
  }

  try {
    const { verified, registrationInfo } = await verifyRegistrationResponse({
      credential: attResp,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: 'http://localhost:3000',
      expectedRPID: 'localhost',
    });

    if (verified) {
      user.credentials.push(registrationInfo);
      delete user.currentChallenge;
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Registration verification failed' });
    }
  } catch (error) {
    console.error('Error verifying registration:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/generate-authentication-options', (req, res) => {
  const { email } = req.body;
  const user = users[email];

  if (!user) {
    return res.status(400).json({ success: false, message: 'User not found' });
  }

  const options = generateAuthenticationOptions({
    allowCredentials: user.credentials.map(cred => ({
      id: cred.credentialID,
      type: 'public-key',
    })),
    userVerification: 'preferred',
  });

  users[email].currentChallenge = options.challenge;

  res.json(options);
});

app.post('/verify-authentication', async (req, res) => {
  const { email, assertionResp } = req.body;
  const user = users[email];

  if (!user) {
    return res.status(400).json({ success: false, message: 'User not found' });
  }

  try {
    const { verified, authenticationInfo } = await verifyAuthenticationResponse({
      credential: assertionResp,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: 'http://localhost:3000',
      expectedRPID: 'localhost',
    });

    if (verified) {
      delete user.currentChallenge;
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Authentication verification failed' });
    }
  } catch (error) {
    console.error('Error verifying authentication:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
