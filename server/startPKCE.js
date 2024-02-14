const fs = require('fs');
const createHash = require('crypto').createHash;

const CLIENTID = "e7a08b539dcf46d7ab61218af6163a64";
const REDIRECTDESTINATION = "https://hyec.gg/spotify/auth.shtml";
const REQUESTEDSCOPE = (
    "playlist-read-private,playlist-modify-private" // Read playlists, Write playlists
  + ",user-read-currently-playing,streaming" // Play/Pause
  + ",user-library-read,user-library-modify"); // View liked, modify liked

function sha256b64(buff) {
  let encoded = createHash("sha256").update(buff).digest().toString("base64");
  return encoded.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function randomStr(len=96) {
  const allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
  return new Array(len).fill(null).map(a=>allowedChars[Math.floor(Math.random()*allowedChars.length)]).join("");
}

let codeVerifier = randomStr(64); // private; sent to spotify with code for apikey
let codeChallenge = sha256b64(codeVerifier); // public; sent to user to send to spotify with login

query = [
  `client_id=${CLIENTID}`,
  `response_type=code`,
  `redirect_uri=${REDIRECTDESTINATION}`,
  `scope=${REQUESTEDSCOPE}`,
  `code_challenge_method=S256`,
  `code_challenge=${codeChallenge}`
  // `state=${}` // this doesn't seem to add any security when spotify enforces the redirect_uri whitelist.
];

console.log("https://accounts.spotify.com/authorize?"+query.join("&"))

query = [
  `client_id=${CLIENTID}`,
  `grant_type=authorization_code`,
  `code=CODEGOESHERE`,
  `redirect_uri=${REDIRECTDESTINATION}`,
  `code_verifier=${codeVerifier}`
]

console.log("\n");
console.log(`curl 'https://accounts.spotify.com/api/token?${query.join("&")}' -X "POST" -H 'accept: */*' -H 'content-type: application/x-www-form-urlencoded' --compressed ; echo`);


