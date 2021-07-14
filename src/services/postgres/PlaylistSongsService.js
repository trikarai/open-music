const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");

class PlaylistSongsService {
  constructor(collaborationService, cacheService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
    this._cacheService = cacheService;
  }

  async addSongToPlayist({ playlistId, songId }) {
    this.verifySongExist(songId);

    const id = `playlistsong-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id",
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan ke dalam playlist");
    }
    await this._cacheService.delete(`playlistsongs:${playlistId}`);
    return result.rows[0].id;
  }

  async getPlaylistsongs(playlistId, owner) {
    try {
      // mendapatkan catatan dari cache
      const result = await this._cacheService.get(
        `playlistsongs:${playlistId}`
      );
      return JSON.parse(result);
    } catch (error) {
      // bila gagal, diteruskan dengan mendapatkan catatan dari database
      const query = {
        text: `SELECT songs.id, songs.title, songs.performer FROM songs LEFT JOIN playlistsongs ON songs.id = playlistsongs.song_id 
      LEFT JOIN playlists ON playlists.id = playlistsongs.playlist_id 
      LEFT JOIN collaborations ON collaborations.playlist_id = playlists.id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1
      GROUP BY playlistsongs.song_id, songs.id`,
        values: [owner],
      };

      const result = await this._pool.query(query);
      const mappedResult = result.rows;

      // catatan akan disimpan pada cache sebelum fungsi getPlaylistsongs dikembalikan
      await this._cacheService.set(
        `playlistsongs:${playlistId}`,
        JSON.stringify(mappedResult)
      );

      return mappedResult;
    }
  }

  async deleteSongFromPlaylist(playlistId, songId, owner) {
    const query = {
      text: "DELETE FROM playlistsongs WHERE playlist_id = $1 AND  song_id = $2 RETURNING id",
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Lagu gagal dihapus. Id tidak ditemukan");
    }
    await this._cacheService.delete(`playlistsongs:${playlistId}`);
  }

  async verifySongExist(id) {
    const query = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Lagu tidak ditemukan");
    }
  }

  async verifyPlaylistOwner(playlistId, credentialId) {
    const query = {
      text: "SELECT * FROM playlists where id = $1",
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Playlists tidak ditemukan");
    }
    const playlist = result.rows[0];
    if (playlist.owner !== credentialId) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }

  async verifyPlaylistAccess(playlistId, credentialId) {
    try {
      await this.verifyPlaylistOwner(playlistId, credentialId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new NotFoundError("Playlists tidak ditemukan");
      }
      try {
        await this._collaborationService.verifyCollaborator(
          playlistId,
          credentialId
        );
      } catch {
        throw new AuthorizationError(
          "Anda tidak berhak mengakses resource ini"
        );
      }
    }
  }
}

module.exports = PlaylistSongsService;
