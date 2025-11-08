const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3001;

// In-memory
const users = [];
const comments = [];
const sessions = {};

// Session functions
function createSession(username) {
  const sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  sessions[sessionId] = { username, expires };
  return { sessionId, expires };
}

function getSession(sessionId) {
  if (!sessionId) return null;
  const session = sessions[sessionId];
  if (!session) return null;

  if (session.expires < new Date()) {
    delete sessions[sessionId];
    return null;
  }

  return session;
}

function destroySession(sessionId) {
  if (sessionId && sessions[sessionId]) {
    delete sessions[sessionId];
  }
}

// View engine
app.engine('hbs', exphbs.engine({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'views', 'partials')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Basic middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// currentUser populated with wild_cookie if valid
app.use((req, res, next) => {
  res.locals.currentUser = null;
  req.currentUser = null;

  const raw = req.cookies && req.cookies.wild_cookie;
  if (!raw) return next();

  try {
    const data = JSON.parse(raw); // username, sessionId, auth, expires
    const session = getSession(data.sessionId);

    if (data.auth && session && session.username === data.username) {
      req.currentUser = { username: data.username };
      res.locals.currentUser = req.currentUser;
    } else {
      // bad or expired: clear
      res.clearCookie('wild_cookie');
    }
  } catch (e) {
    // malformed: clear
    res.clearCookie('wild_cookie');
  }

  next();
});

// Helper function to require login
function requireLogin(req, res, next) {
  if (!req.currentUser) {
    return res.status(401).send('Please log in.');
  }
  next();
}

// Home
app.get('/', (req, res) => {
  res.render('home');
});

// Register
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).render('register', { error: 'Username & password please...' });
  }

  const existing = users.find(u => u.username === username);
  if (existing) {
    return res.status(400).render('register', { error: 'Username already taken.' });
  }

  users.push({ username, password });

  res.render('login', { message: 'Registered. Please log in.' });
});

// Login
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).render('login', { error: 'Invalid username or password.' });
  }

  const { sessionId, expires } = createSession(user.username);

  // Cookie data
  const cookieData = {
    username: user.username,
    sessionId,
    auth: true,
    expires: expires.toISOString()
  };

  res.cookie('wild_cookie', JSON.stringify(cookieData), {
    maxAge: 24 * 60 * 60 * 1000
  });

  res.redirect('/');
});

// Logout
app.post('/logout', (req, res) => {
  const raw = req.cookies && req.cookies.wild_cookie;

  if (raw) {
    try {
      const data = JSON.parse(raw);
      destroySession(data.sessionId);
    } catch (e) {}
  }

  res.clearCookie('wild_cookie');
  res.redirect('/');
});

// View comments
app.get('/comments', (req, res) => {
  res.render('comments', { comments });
});

// Post comment
app.get('/comment/new', (req, res) => {
  if (!req.currentUser) {
    return res.render('login', { error: 'Log in to post a comment.' });
  }
  res.render('post');
});

app.post('/comment', requireLogin, (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).render('post', { error: 'No empty comment.' });
  }

  comments.push({
    author: req.currentUser.username,
    text,
    createdAt: new Date().toISOString()
  });

  res.redirect('/comments');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
