const fs = require('fs');
const createHash = require('crypto').createHash;

const CLIENTID = "e7a08b539dcf46d7ab61218af6163a64";
const REDIRECTDESTINATION = "https://hyec.gg/spotify/authCallback";
const REQUESTEDSCOPE = (
    "playlist-read-private,playlist-modify-private" // Read playlists, Write playlists
  + ",user-read-currently-playing,streaming" // Play/Pause
  + ",user-library-read,user-library-modify"); // View liked, modify liked
const PENDINGAUTHLIFESPAN = 300e3; // Expire auth attempts after 5 minute.
const PENDINGAUTHSPATH = "state/pendingAuths.json";

function sha256b64(buff) {
  let encoded = createHash("sha256").update(buff).digest().toString("base64");
  return encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function randomStr(len=96) {
  const allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
  return new Array(len).fill(null).map(a=>allowedChars[Math.floor(Math.random()*allowedChars.length)]).join("");
}
function randomState(len=64) {
  const allowedChars = "0123456789ABCDEF";
  return new Array(len).fill(null).map(a=>allowedChars[Math.floor(Math.random()*allowedChars.length)]).join("");
}

let state = randomState(); // unique id to identify this authorization request
let codeVerifier = randomStr(64); // private; sent to spotify with code for apikey
let codeChallenge = sha256b64(codeVerifier); // public; sent to user to send to spotify with login

query = [
  `client_id=${CLIENTID}`,
  `response_type=code`,
  `redirect_uri=${REDIRECTDESTINATION}`,
  `scope=${REQUESTEDSCOPE}`,
  `code_challenge_method=S256`,
  `code_challenge=${codeChallenge}`,
  `state=${state}` // this doesn't seem to add any security when spotify enforces the redirect_uri whitelist.
];

const now = +new Date();

function readOrDefault(fname, defaultValue) {
  if (fs.existsSync(fname))
    return fs.readFileSync(fname);
  return defaultValue;
}

let pendingAuths = JSON.parse(readOrDefault(PENDINGAUTHSPATH,"[]"));

// Remove expired entries.
pendingAuths = pendingAuths.filter(a=>a.timestamp <= now && a.timestamp+PENDINGAUTHLIFESPAN >= now);

// Add this auth request
pendingAuths.push({
  state,
  timestamp:now,
  codeVerifier,
  codeChallenge
});

// Save file
fs.writeFileSync(PENDINGAUTHSPATH,JSON.stringify(pendingAuths,null,2));

console.log(`<meta http-equiv="refresh" content="0; url=https://accounts.spotify.com/authorize?${query.join("&")}" />`)
