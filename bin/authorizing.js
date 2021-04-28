module.exports = (() => {
  const jwt = require("jsonwebtoken");
  const secret = process.env.SECRET_KEY || "SECRET";

  const handleAuthorization = async (socket, next) => {
    if (await isValid(socket)) {
      next();
    } else {
      next(new Error("Authorization error"));
    }
  };

  const handleAddParamsToSocket = async (socket, next) => {
    await addParamsToSocket(socket);
    next();
  };

  // PRIVATE

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

  return {
    handleAddParamsToSocket,
    handleAuthorization,
  };
})();
