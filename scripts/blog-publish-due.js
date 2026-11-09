const { getTodayInZagreb, posts } = require("./build-blog");

function shouldPublish(now = new Date()) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Zagreb",
    hour: "2-digit",
    hourCycle: "h23"
  }).format(now));
  const today = getTodayInZagreb(now);
  return hour === 8 && posts.some((post) => post.date === today);
}

module.exports = { shouldPublish };

if (require.main === module) {
  console.log(`publish=${shouldPublish()}`);
}
