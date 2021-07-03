const routes = (handler) => [
  {
    method: "POST",
    path: "/playlists/{playlistId}/songs",
    handler: handler.addSongToPlaylistHandler,
    options: {
      auth: "songsapp_jwt",
    },
  },
  {
    method: "GET",
    path: "/playlists/{playlistId}/songs",
    handler: handler.getSongsFromPlaylistHandler,
    options: {
      auth: "songsapp_jwt",
    },
  },
  {
    method: "DELETE",
    path: "/playlists/{playlistId}/songs",
    handler: handler.deleteSongsFromPlaylistHandler,
    options: {
      auth: "songsapp_jwt",
    },
  },
];
