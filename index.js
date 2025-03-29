/**
 * Zeus Discord Bot Dashboard Server
 * Express.js server configuration for hosting the Zeus Bot dashboard
 */

// Load environment variables
require('dotenv').config();

// Import dependencies
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const DiscordOAuth2 = require('discord-oauth2');
const morgan = require('morgan');

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Discord OAuth configuration
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1353340921831493714';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const REDIRECT_URI = 'https://xxybg5xx.github.io/dashboard';
const oauth = new DiscordOAuth2();

// Configure middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev')); // Logging middleware

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'zeus-bot-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    sameSite: 'lax'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Discord strategy setup
passport.use(new DiscordStrategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: CALLBACK_URL,
  scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
  // Store tokens in user profile for later API calls
  profile.accessToken = accessToken;
  profile.refreshToken = refreshToken;
  
  return done(null, profile);
}));

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Auth middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // Save intended destination
  req.session.redirectTo = req.originalUrl;
  return res.redirect('/auth/discord');
}

// Serve static files from the current directory
app.use(express.static(__dirname));

// Define routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Authentication Routes
app.get('/auth/discord', passport.authenticate('discord'));

app.get('/auth/discord/callback', 
  passport.authenticate('discord', { 
    failureRedirect: '/?error=auth_failed' 
  }), 
  (req, res) => {
    // Redirect to previously intended destination or dashboard
    const redirectTo = req.session.redirectTo || '/dashboard';
    delete req.session.redirectTo;
    res.redirect(redirectTo);
  }
);

app.post('/auth/discord/callback', async (req, res) => {
  const { code } = req.body;
  
  try {
      const oauthResult = await oauth.tokenRequest({
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          code: code,
          scope: ['identify', 'guilds'],
          grantType: 'authorization_code',
          redirectUri: REDIRECT_URI
      });
      
      res.json({ 
          access_token: oauthResult.access_token,
          refresh_token: oauthResult.refresh_token
      });
  } catch (error) {
      console.error('Auth Error:', error);
      res.status(401).json({ error: 'Authentication failed' });
  }
});

app.get('/auth/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/?logout=success');
  });
});

// User API endpoint
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      id: req.user.id,
      username: req.user.username,
      discriminator: req.user.discriminator || '0',
      avatar: req.user.avatar,
      guilds: req.user.guilds,
      locale: req.user.locale
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Dashboard Routes
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard', 'index.html'));
});

// API Routes
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'Zeus bot is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API endpoint for user's servers (guilds)
app.get('/api/guilds', isAuthenticated, async (req, res) => {
  try {
    // If we have guilds data directly from Discord OAuth
    if (req.user.guilds) {
      // Filter and return only the guilds where user has admin permission
      const adminGuilds = req.user.guilds.filter(guild => {
        // Bitwise check for ADMINISTRATOR permission (0x8)
        return (guild.permissions & 0x8) === 0x8;
      });
      
      return res.json(adminGuilds);
    }
    
    // Otherwise attempt to fetch using token
    if (!req.user.accessToken) {
      return res.status(401).json({ error: 'No access token available' });
    }
    
    // Fetch guilds with the user's token
    const guilds = await oauth.getUserGuilds(req.user.accessToken);
    
    // Filter for guilds where user has admin permissions
    const adminGuilds = guilds.filter(guild => {
      return (guild.permissions & 0x8) === 0x8;
    });
    
    res.json(adminGuilds);
  } catch (error) {
    console.error('[ERROR] Failed to fetch guilds:', error);
    res.status(500).json({ error: 'Failed to fetch guilds' });
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`[SERVER] ⚡ Zeus Bot Dashboard is running`);
  console.log(`[SERVER] 🌐 Server: http://localhost:${port}`);
  console.log(`[SERVER] 🕒 Time: ${new Date().toLocaleString()}`);
});

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('[ERROR] Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('[ERROR] Uncaught exception:', error);
  // Keep the process running
});