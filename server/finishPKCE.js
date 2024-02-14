const fs = require('fs');
const https = require('https');

const CLIENTID = "e7a08b539dcf46d7ab61218af6163a64";
const REDIRECTDESTINATION = "https://hyec.gg/spotify/authCallback";
const PENDINGAUTHLIFESPAN = 300e3; // Expire auth attempts after 5 minutes.
const PENDINGAUTHSPATH = "state/pendingAuths.json";
const ACTIVESESSIONS = "state/activeSessions.json";

const now = +new Date();


setTimeout(()=>{
  let [codeArg, stateArg] = readProcessArgs();


  let authReq = findPendingAuthByState(stateArg);
  if (!authReq) {
    if (stateArg)
      console.log("State expired. Please try again. (Passed state: "+stateArg+")");
    else
      console.log("No state value passed: "+JSON.stringify({stateArg,codeArg,argv:process.argv}));
    return;
  }
  let requestOpts = buildRequest(authReq.codeVerifier, codeArg);
  doRequest(requestOpts).then(({statusCode, data})=>{
    if (statusCode==200)
      saveToken(JSON.parse(data));
    else
      console.log('Non-zero status:',statusCode,data);
  });
},0);





function readOrDefault(fname, defaultValue) {
  if (fs.existsSync(fname))
    return fs.readFileSync(fname);
  return defaultValue;
}

// Returns [codeArg, stateArg].
function readProcessArgs() {
  // Code and State passed
  if (process.argv.length == 4)
    return [process.argv[2], process.argv[3]];
  // Query string passed
  if (process.argv.length == 3)
    return process.argv[2].replace("?","").split("&").map(a=>a.split("=")).sort().map(a=>a[1]);
  console.log(`Wrong number of arguments. Expected code and state, or query string. Instead got ${process.argv.length-2} arguments.`);
}

function saveToken(responseObject) {
  // Load file
  let activeSessions = JSON.parse(readOrDefault(ACTIVESESSIONS,"[]"));
  // Remove expired entries.
  activeSessions = activeSessions.filter(a=>a.timestamp+a.expires_in*1000>=now);
  // Add this session
  responseObject.timestamp = now;
  activeSessions.push(responseObject);
  // Save file
  fs.writeFileSync(ACTIVESESSIONS,JSON.stringify(activeSessions,null,2));
  // Done!
  console.log("Successfully saved!")
}

function doRequest(requestOpts) {
  return new Promise((resolve,reject) => {
    let statusCode = null;
    let data = [];
    const req = https.request(requestOpts, res=>{
      statusCode = res.statusCode;
      res.on('data', d=>data.push(d));
      res.on('end', ()=>resolve({statusCode,data:data.join("")}));
    });
    req.on('error', e=>reject(e));
    req.end();
  });
}

function buildRequest(codeVerifier, codeArg) {
  query = [
    `client_id=${CLIENTID}`,
    `grant_type=authorization_code`,
    `code=${codeArg}`,
    `redirect_uri=${REDIRECTDESTINATION}`,
    `code_verifier=${codeVerifier}`
  ];
  let requestOpts = {
    hostname: 'accounts.spotify.com',
    path: `/api/token?${query.join('&')}`,
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  return requestOpts;
}

function findPendingAuthByState(stateArg) {
  let pendingAuths = JSON.parse(readOrDefault(PENDINGAUTHSPATH,"[]"));

  // Find this auth request
  const found = pendingAuths.find(a=>a.state === stateArg);

  // Remove expired entries.
  pendingAuths = pendingAuths.filter(a=> a!=found && a.timestamp<=now && a.timestamp+PENDINGAUTHLIFESPAN>=now);

  // Save file
  fs.writeFileSync(PENDINGAUTHSPATH,JSON.stringify(pendingAuths,null,2));
  return found;
}

