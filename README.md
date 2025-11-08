# Wild West Forum

COS 498 Server-Side Web Development: Midterm Project

This project is a small web forum built with Node.js and Express. It’s intentionally insecure, hence it has "wild west" in the title. Users can register, log in, post comments, and view others' comments.

# Overview

- The Wild West Forum uses an Express web server with Handlebars templates for pages.
- User data, comments, and sessions are all stored in memory.
- When someone logs in, the server gives them a cookie with basic info about their session.
- That cookie is not secure.
- The app is also Dockerized.

There are two containers:

- One for the Node.js app

- One for an nginx proxy that forwards web requests to it

# Features

- Register and log in with a username and password (stored plaintext)

- Insecure cookie session system called “wild_cookie”

- Post and view comments on a shared forum page

- Handlebars templates with layouts and partials

- Two-container setup using Docker and nginx

# How to Run Locally

Make sure Node.js and npm are installed.

Open a terminal and go into the app folder:

cd app
npm install
npm start

Visit http://localhost:3000 to use the site locally.

You can register, log in, make comments, and log out.
Everything resets when the server restarts because there’s no database.

# Running with Docker

If you have Docker installed, you can run everything using:

docker compose up --build

That builds both the Node app and the nginx proxy.
When it’s done, visit:

http://localhost:8383