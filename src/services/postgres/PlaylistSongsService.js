const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlayist({ playlistId, songId }) {
    // this.verifySongExist(songId);

    const id = `playlistsong-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id",
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan ke dalam playlist");
    }
    return result.rows[0].id;
  }

  async getPlaylistsongs(playlistId) {
    const query = {
      text: "SELECT songs.id, songs.title, songs.performer FROM playlistsongs JOIN songs ON songs.id = playlistsongs.song_id  WHERE playlist_id = $1",
      values: [playlistId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }

  async deleteSongFromPlaylist({ playlistId, songId }) {
    const query = {
      text: "DELETE FROM playlistsongs WHERE playlist_id = $1 AND  song_id = $2",
      values: [playlistId, songId],
    };

    await this._pool.query(query);
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
  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses resource ini");
    }
  }
}

module.exports = PlaylistSongsService;
