const Ajv = require("ajv");

// Shared Ajv instance with allErrors enabled
const ajv = new Ajv({ allErrors: true });

// Escape regex special characters to prevent ReDoS
function escapeRegex(str = "") {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  ajv,
  escapeRegex,
};
