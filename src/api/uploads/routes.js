const routes = (handler) => [
  {
    method: "POST",
    path: "/upload/pictures",
    handler: handler.postUploadImageHandler,
    options: {
      payload: {
        maxBytes: 500000,
        allow: "multipart/form-data",
        multipart: true,
        output: "stream",
      },
    },
  },
];

module.exports = routes;
