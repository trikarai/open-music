const Joi = require("joi");

const ExportPLaylistsPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = ExportPLaylistsPayloadSchema;
