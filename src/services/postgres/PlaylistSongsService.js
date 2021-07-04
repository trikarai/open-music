const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlayist(playlistId, songId) {
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

  async deleteSongFromPlaylist(songId) {
    const query = {
      text: "DELETE FROM playlistsongs WHERE song_id = $1",
      values: [songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError(
        "Lagu gagal dihapus dari playlist. Id tidak ditemukan"
      );
    }
  }

  async verifySongExist(id) {
    const query = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Lagu tidak ditemukan");
    }
  }
}

module.exports = PlaylistSongsService;
