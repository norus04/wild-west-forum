const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory
const users = [];
const comments = [];
const sessions = {};

// Insecure session functions
function createSession(username) {
  const sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
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

app.get('/', (req, res) => {
  res.send('Wild West Forum is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
