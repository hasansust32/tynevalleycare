// Values computed when the site is built. `version` cache-busts CSS and JS after each deploy.
const now = new Date();

export default {
  version: now.getTime().toString(36),
  isoDate: now.toISOString().slice(0, 10),
  year: now.getFullYear(),
};
