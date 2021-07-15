const ClientError = require("../../exceptions/ClientError");

class ExportsHandler {
  constructor(service, validator, playlistsongsService) {
    this._service = service;
    this._validator = validator;
    this._playlistsongsService = playlistsongsService;
    this.postExportPlaylistsHandler =
      this.postExportPlaylistsHandler.bind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { playlistId } = request.params;

      await this._playlistsongsService.verifyPlaylistAccess(
        playlistId,
        credentialId
      );
      this._validator.validateExportPlaylistsPayload(request.payload);

      const message = {
        targetEmail: request.payload.targetEmail,
        playlistId: playlistId,
      };

      await this._service.sendMessage(
        "export:playlistsongs",
        JSON.stringify(message)
      );
      const response = h.response({
        status: "success",
        message: "Permintaan Anda sedang kami proses",
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      // Server ERROR!
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = ExportsHandler;
