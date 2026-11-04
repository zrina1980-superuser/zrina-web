"use strict";

self.onmessage = ({data}) => {
  try {
    const {pattern, flags, text, replacement} = data;
    const re = new RegExp(pattern, flags);
    const matches = [];
    let m;
    do {
      m = re.exec(text);
      if (!m) break;
      matches.push({number: matches.length + 1, index: m.index, full: m[0], captures: Array.from(m).slice(1), groups: m.groups || null});
      if (!(flags.includes("g") || flags.includes("y"))) break;
      if (m[0] === "") {
        if (re.lastIndex >= text.length) break;
        const cp = text.codePointAt(re.lastIndex);
        re.lastIndex += flags.includes("u") && cp > 0xFFFF ? 2 : 1;
      }
      if (matches.length >= 500) {
        if (re.exec(text)) {
          self.postMessage({matches, truncated: true, replacement: "Replacement omitted because the 500-match limit was reached."});
          return;
        }
        break;
      }
    } while (true);
    const replacementResult = text.replace(new RegExp(pattern, flags), replacement);
    self.postMessage({
      matches,
      truncated: false,
      replacement: replacementResult.length > 200000
        ? "Replacement output exceeds the 200,000 character display limit."
        : replacementResult
    });
  } catch (error) {
    self.postMessage({error: error.message || String(error)});
  }
};

self.postMessage({ready: true});
