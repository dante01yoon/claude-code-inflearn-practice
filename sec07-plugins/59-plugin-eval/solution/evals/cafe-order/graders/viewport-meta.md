---
type: regex
pattern: '<meta[^>]+name=["'']viewport["'']'
flags: i
target: { source: file, path: index.html }
---
