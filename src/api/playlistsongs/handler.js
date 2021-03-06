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
      const { id: credentialId } = request.auth.credentials;

      const { songId } = request.payload;
      const { playlistId } = request.params;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);

      const playlistsongId = await this._service.addSongToPlayist({
        playlistId,
        songId,
      });
      const response = h.response({
        status: "success",
        message: "Lagu berhasil ditambahkan ke playlist",
        data: {
          playlistsongId: playlistsongId,
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

  async getSongsFromPlaylistHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { playlistId } = request.params;

      await this._service.verifyPlaylistAccess(playlistId, credentialId);

      const songs = await this._service.getPlaylistsongs(
        playlistId,
        credentialId
      );

      return {
        status: "success",
        data: { songs },
      };
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

  async deleteSongsFromPlaylistHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;

      const { songId } = request.payload;
      const { playlistId } = request.params;

      await this._service.verifySongExist(songId);
      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.deleteSongFromPlaylist(
        playlistId,
        songId,
        credentialId
      );

      return {
        status: "success",
        message: "Lagu berhasil dihapus dari playlist",
      };
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
