---
slug: primeiro-post
translationKey: primeiro-post
title: First post
kicker: EXAMPLE
date: 2026-09-26
readingTime: 2 MIN READ
author: kawhan
excerpt: An example post that exists only to demonstrate the site's editorial format. Replace or delete it once you publish your first real piece.
cover: https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80
coverAlt: Desk with an open notebook and a keyboard
published: true
locale: en
---

This post exists only to show how content is structured. It keeps the validators passing while you have not written anything yet. Edit over it or delete the folder entirely.

## How a post works

Each post is a folder under `src/content/posts/`, named with the date and the slug. Inside it live two files: `pt-BR.md` and `en.md`. Both must exist, and some fields must match exactly between them.

- `slug`, `translationKey`, `date`, `cover` and `author` must be identical across both languages
- `published` must match too — you cannot publish in one language only
- `title`, `excerpt`, `kicker` and the body are free to differ

If any of those fields diverge, `npm run validate:editorial` fails and points at the offending file.

## What the markdown supports

The parser is homegrown and deliberately small. It understands paragraphs, level-two headings, dash lists and code blocks:

```bash
npm run validate:editorial
```

Embedded HTML is not supported, and that is intentional: with no `dangerouslySetInnerHTML` in the path, content cannot introduce an XSS surface.

## Next steps

Delete this folder, create your own with today's date, and write. The blog index, RSS, sitemap and prerendered pages all update themselves from the files.
