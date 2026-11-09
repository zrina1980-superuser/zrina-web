const hour = Number(new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Zagreb",
  hour: "2-digit",
  hourCycle: "h23"
}).format(new Date()));

console.log(`publish=${hour === 8}`);
