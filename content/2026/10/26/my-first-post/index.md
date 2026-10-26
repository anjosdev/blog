---
title: "My first post"
description: "A small place for notes on data, code, and the things learned along the way."
---

Every now and then, a small problem leads to something worth writing down. A query that finally makes sense. A better way to move data. A question that stays interesting after the work is done.

This is a place for those notes.

## Start small

The best notes don't need to be complete guides. Sometimes a few lines of code and an explanation are enough to make an idea useful to someone else — or to your future self.

```python
from pathlib import Path

notes = sorted(Path("content").rglob("index.md"))
for note in notes:
    print(note.parent.name)
```

## A few things to write about

- **Data engineering:** turning raw data into something people can use.
- **Small tools:** scripts that make everyday work a little easier.
- **Learning in public:** questions, experiments, and lessons along the way.

> Write the note you wish you had found when you started.

There is no publishing schedule here. Just room to think, build, and share.

You can find a little more about me on my [profile](https://anjos.dev).
