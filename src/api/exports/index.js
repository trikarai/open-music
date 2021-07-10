const ExportsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "exports",
  version: "1.0.0",
  register: async (server, { service, validator, playlistsongsService }) => {
    const exportsHandler = new ExportsHandler(
      service,
      validator,
      playlistsongsService
    );
    server.route(routes(exportsHandler));
  },
};
