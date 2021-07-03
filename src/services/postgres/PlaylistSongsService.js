const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class PlaylistSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongToPlayist(playlistId, songId) {
    const id = `playlistsong-${nanoid(16)}`;

    const query = {
      text: "INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id",
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError("Playlist gagal ditambahkan");
    }

    return result.rows[0].id;
  }
}

module.exports = PlaylistSongsService;
