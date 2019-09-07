// close the server
module.exports = async () => {
    await global.httpServer.close();
};