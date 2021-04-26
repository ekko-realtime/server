const jwt = require("jsonwebtoken");
const secret = process.env.EKKO_SECRET || "SECRET";

const isValid = async (socket) => {
  const appNameParam = getAppName(socket);
  const token = getToken(socket);

  return jwt.verify(token, secret, (err, decoded) => {
    if (err) return false;
    return decoded.appName === appNameParam;
  });
};

const addParamsToSocket = async (socket) => {
  const token = getToken(socket);
  const { appName, admin } = jwt.verify(token, secret);
  socket.appName = appName;
  socket.admin = admin;
  return;
};

const getAppName = (socket) => {
  return socket.nsp.name.slice(1);
};

const getToken = (socket) => {
  return socket.handshake.auth.jwt;
};

module.exports = {
  isValid,
  addParamsToSocket,
};
