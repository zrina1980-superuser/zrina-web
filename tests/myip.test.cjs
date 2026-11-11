const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'myip', 'index.html'), 'utf8');
const script = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));

function harness(offerFails = false) {
  const elements = {};
  const element = id => elements[id] ||= { textContent: '', innerHTML: '', className: '', insertAdjacentHTML() {} };
  let peer;
  class Peer {
    constructor() { peer = this; this.closed = false; }
    createDataChannel() {}
    createOffer() { return offerFails ? Promise.reject(new Error('failed')) : Promise.resolve({}); }
    setLocalDescription() { return Promise.resolve(); }
    close() { this.closed = true; }
  }
  vm.runInNewContext(script, {
    document: { getElementById: element },
    window: { RTCPeerConnection: Peer },
    RTCPeerConnection: Peer,
    fetch: async () => { throw new Error('test network unavailable'); },
    AbortController, setTimeout: () => 1, clearTimeout() {},
    navigator: { language: 'en', platform: 'test' }, Intl, Promise
  });
  return { element, get peer() { return peer; } };
}

test('no WebRTC candidates is explicitly inconclusive', () => {
  const h = harness();
  h.element('rtcBtn').onclick();
  h.peer.onicecandidate({ candidate: null });
  assert.equal(h.peer.closed, true);
  assert.match(h.element('rtcVerdict').textContent, /Inconclusive/);
});

test('WebRTC setup failure closes the connection and reports uncertainty', async () => {
  const h = harness(true);
  h.element('rtcBtn').onclick();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.peer.closed, true);
  assert.match(h.element('rtcVerdict').textContent, /no conclusion/);
});
