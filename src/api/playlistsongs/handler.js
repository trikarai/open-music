const ClientError = require("../../exceptions/ClientError");

class PlaylistSongs {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.addSongToPlaylistHandler = this.addSongToPlaylistHandler.bind(this);
    this.getSongsFromPlaylistHandler =
      this.getSongsFromPlaylistHandler.bind(this);
    this.deleteSongsFromPlaylistHandler =
      this.deleteSongsFromPlaylistHandler.bind(this);
  }

  async addSongToPlaylistHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);

      const { playlistId, songId } = request.payload;
      const songId = await this._service.addSongToPlayist({
        playlistId,
        songId,
      });
      const response = h.response({
        status: "success",
        message: "Lagu berhasil ditambahkan ke playlist",
        data: {
          playlistId: playlistId,
        },
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

      // SERVER ERROR
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami",
      });
      response.code(500);
      console.log(error);
      return response;
    }
  }
}

module.exports = PlaylistSongs;
