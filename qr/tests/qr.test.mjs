import test from "node:test";
import assert from "node:assert/strict";
import { buildText, buildUrl, buildWifi, buildVcard, buildEmail, buildSms, parseBatch, safeFileName, PayloadError } from "../src/payload.mjs";
import { makeMatrix, toSvg, captionBand, setPngDpi300, layout, contrast } from "../src/render.mjs";
import { zipSync, unzipSync, strToU8 } from "fflate";

test("URL normalisation and rejection", () => {
  assert.equal(buildUrl("example.com"), "https://example.com/");
  assert.equal(buildUrl("localhost:8080/x"), "https://localhost:8080/x");
  assert.equal(buildUrl("http://a.test/p?q=1"), "http://a.test/p?q=1");
  for (const bad of ["javascript:alert(1)", "data:text/html,hi", "https://u:p@a.test", "", "http://", "a b\nc"]) assert.throws(() => buildUrl(bad), PayloadError, bad);
});

test("text rejects empty", () => {
  assert.equal(buildText("hi"), "hi");
  assert.throws(() => buildText("  "), PayloadError);
});

test("WiFi escaping and security modes", () => {
  assert.equal(buildWifi({ ssid: "My;Net:1", password: 'p"a\\ss,word', security: "WPA", hidden: true }), 'WIFI:T:WPA;S:My\\;Net\\:1;P:p\\"a\\\\ss\\,word;H:true;;');
  assert.equal(buildWifi({ ssid: "Open", security: "nopass" }), "WIFI:T:nopass;S:Open;;");
  assert.equal(buildWifi({ ssid: "1234", password: "12345678", security: "WPA" }), 'WIFI:T:WPA;S:"1234";P:"12345678";;');
  assert.equal(buildWifi({ ssid: "w", password: "hello", security: "WEP" }), "WIFI:T:WEP;S:w;P:hello;;");
});

test("WiFi errors", () => {
  assert.throws(() => buildWifi({ ssid: "", password: "12345678" }), PayloadError);
  assert.throws(() => buildWifi({ ssid: "a", password: "short", security: "WPA" }), PayloadError);
  assert.throws(() => buildWifi({ ssid: "a", password: "", security: "WPA" }), PayloadError);
  assert.throws(() => buildWifi({ ssid: "a", password: "abcd", security: "WEP" }), PayloadError);
  assert.throws(() => buildWifi({ ssid: "a".repeat(33), security: "nopass" }), PayloadError);
  assert.throws(() => buildWifi({ ssid: "a\nb", security: "nopass" }), PayloadError);
  assert.throws(() => buildWifi({ ssid: "a", security: "X" }), PayloadError);
});

test("vCard escaping, folding, validation", () => {
  const v = buildVcard({ firstName: "Ana", lastName: "Horvat; Jr", org: "A,B", email: "ana@example.com", phone: "+385 91 234", url: "example.com", note: "x".repeat(200) + "\nline" });
  assert.match(v, /^BEGIN:VCARD\r\nVERSION:3\.0\r\n/);
  assert.match(v, /N:Horvat\\; Jr;Ana;;;/);
  assert.match(v, /ORG:A\\,B/);
  assert.match(v, /URL:https:\/\/example\.com\//);
  assert.ok(v.split("\r\n").every((l) => new TextEncoder().encode(l).length <= 75));
  assert.ok(v.endsWith("END:VCARD\r\n"));
  assert.throws(() => buildVcard({}), PayloadError);
  assert.throws(() => buildVcard({ firstName: "A", email: "bad" }), PayloadError);
  assert.throws(() => buildVcard({ firstName: "A\r\nEND:VCARD" }), PayloadError);
});

test("email and SMS", () => {
  assert.equal(buildEmail({ to: "a@b.co", subject: "Hi & bye", body: "l1\nl2" }), "mailto:a@b.co?subject=Hi%20%26%20bye&body=l1%0D%0Al2");
  assert.equal(buildEmail({ to: "a@b.co" }), "mailto:a@b.co");
  assert.throws(() => buildEmail({ to: "nope" }), PayloadError);
  assert.throws(() => buildEmail({ to: "a@b.co,c@d.co" }), PayloadError);
  assert.throws(() => buildEmail({ to: "a@b.co", subject: "x\r\nBcc: y@z.co" }), PayloadError);
  assert.equal(buildSms({ number: "+385 91-234 5678", message: "Hi there" }), "sms:+385912345678?body=Hi%20there");
  assert.throws(() => buildSms({ number: "abc" }), PayloadError);
  assert.throws(() => buildSms({ number: "" }), PayloadError);
});

test("batch parsing", () => {
  const { items, errors } = parseBatch("https://a.test\n\nplain text\njavascript:alert(1)\nwww.b.test");
  assert.equal(items.length, 4);
  assert.equal(items[0].payload, "https://a.test/");
  assert.equal(errors.length, 0);
  const r = parseBatch("http://u:p@a.test\nok");
  assert.equal(r.errors[0].line, 1);
  assert.throws(() => parseBatch("x\n".repeat(201)), PayloadError);
  assert.equal(safeFileName("https://a.test/../x?y", 2), "002-a-test-x-y");
});

test("matrix, svg, layout, capacity errors", () => {
  const m = makeMatrix("HELLO", "M");
  assert.equal(m.size, 21);
  const svg = toSvg(m, { fg: "#000000", bg: "#ffffff", transparent: true, margin: 4, size: 256 });
  assert.ok(svg.startsWith("<svg") && !svg.includes("<rect") && !/script|onload|href/i.test(svg));
  assert.match(toSvg(m, { fg: "#112233", bg: "#ffffff", transparent: false, margin: 4, size: 256 }), /<rect width="29"/);
  assert.throws(() => toSvg(m, { fg: "red", bg: "#fff", margin: 4, size: 256 }), /#RRGGBB/);
  assert.throws(() => makeMatrix("x".repeat(3000), "H"), /too long/);
  assert.throws(() => makeMatrix("x", "Z"));
  assert.deepEqual(layout(21, 500, 4, true), { scale: 17, px: 500, total: 29, offset: 3 });
  for (const size of [128, 300, 512, 1000, 1023, 1024]) {
    const l = layout(25, size, 4, true);
    assert.equal(l.px, size, `print size ${size}`);
    assert.ok(Number.isInteger(l.scale) && l.offset >= 0 && l.offset * 2 + l.scale * l.total <= size);
  }
  assert.equal(layout(25, 1024, 4, true).px, 1024);
  assert.throws(() => layout(177, 128, 4, true), /too dense/);
  const ps = toSvg(m, { fg: "#000000", bg: "#ffffff", transparent: false, margin: 4, size: 1024, print: true });
  assert.match(ps, /width="1024" height="1024" viewBox="0 0 1024 1024"/);
  assert.ok(contrast("#000000", "#ffffff") > 20);
});

test("PNG 300 DPI chunk", () => {
  const png = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64"));
  const out = setPngDpi300(png);
  assert.equal(out.length, png.length + 21);
  assert.equal(Buffer.from(out.subarray(37, 41)).toString(), "pHYs");
  assert.equal(Buffer.from(out).readUInt32BE(41), 11811);
});

test("ZIP round trip", () => {
  const out = unzipSync(zipSync({ "001-a.png": [strToU8("x"), { level: 0 }] }));
  assert.equal(Buffer.from(out["001-a.png"]).toString(), "x");
});
test("Wi-Fi caption off and on in SVG", () => {
  const m = makeMatrix("WIFI:T:WPA;S:Net;P:s3cret<&>pw;;", "M");
  const base = { fg: "#000000", bg: "#ffffff", transparent: false, margin: 4, size: 512 };
  const off = toSvg(m, base);
  assert.ok(!off.includes("<text") && !off.includes("s3cret"));
  assert.match(off, /width="512" height="512"/);
  const caption = ["Network: Net", "Password: s3cret<&>pw"];
  const on = toSvg(m, { ...base, caption });
  const band = captionBand(caption, 512);
  assert.match(on, new RegExp(`width="512" height="${512 + band.height}"`));
  assert.ok(on.includes("Password: s3cret&lt;&amp;&gt;pw") && !on.includes("<&>"));
  assert.ok(toSvg(m, { ...base, caption, print: true, size: 1024 }).includes('viewBox="0 0 1024 '));
});

test("caption wraps a 63-character password within the image width", () => {
  const band = captionBand(["Network: x", `Password: ${"a".repeat(63)}`], 128);
  assert.ok(band.lines.length > 2);
  assert.ok(band.lines.every((l) => l.length * band.fs * 0.6 <= 128));
  assert.equal(band.lines.join("").replace("Network: x", ""), `Password: ${"a".repeat(63)}`);
});
test("caption size and print layout stay consistent", () => {
  assert.equal(captionBand(["x"], 1024).fs, 48);
  assert.equal(captionBand(["x"], 128).fs, 11);
  const m = makeMatrix("WIFI:T:WPA;S:Net;P:abcdefgh;;", "M");
  const o = { fg: "#000000", bg: "#ffffff", transparent: false, margin: 4, size: 1024, print: true, caption: ["Network: Net", "Password: abcdefgh"] };
  const band = captionBand(o.caption, 1024);
  assert.match(toSvg(m, o), new RegExp(`width="1024" height="${1024 + band.height}"`));
  assert.ok(band.lines.every((l) => l.length * band.fs * 0.6 <= 1024));
  const tr = toSvg(m, { ...o, print: false, transparent: true });
  assert.ok(!/<rect width="\d+" height="\d+" fill="#ffffff"/.test(tr.replace(/<rect x=.*?\/>/g, "")) && tr.includes("<text"));
});