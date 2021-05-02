const jwt = require("jsonwebtoken");
const secret = process.env.SECRET_KEY || "SECRET";

const handleAuthorization = (socket, next) => {
  if (validateAppCredentials(socket)) {
    next();
  } else {
    next(new Error("Authorization error"));
  }
};

const handleAddParamsToSocket = (socket, next) => {
  addParamsToSocket(socket);
  next();
};

const handleAssociationsDecoding = (token) => {
  console.log("token: ", token);
  try {
    const associations = jwt.verify(token, secret);
    return JSON.stringify(associations);
  } catch (error) {
    console.error(error);
    return false;
  }
};

// PRIVATE

const validateAppCredentials = (socket) => {
  const appNameParam = getAppName(socket);
  const token = getToken(socket);

  try {
    const decoded = jwt.verify(token, secret);
    return decoded.appName === appNameParam;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const addParamsToSocket = (socket) => {
  const token = getToken(socket);
  const uuid = getUuid(socket);
  const { appName, admin } = jwt.verify(token, secret);

  socket.appName = appName;
  socket.admin = admin;
  socket.uuid = uuid;

  return;
};

const getAppName = (socket) => {
  return socket.nsp.name.slice(1);
};

const getToken = (socket) => {
  return socket.handshake.auth.jwt;
};

const getUuid = (socket) => {
  return socket.handshake.auth.uuid;
};

module.exports = {
  handleAddParamsToSocket,
  handleAuthorization,
  handleAssociationsDecoding,
};
