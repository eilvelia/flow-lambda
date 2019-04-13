## flow-lambda

Type-level lambda calculus implementation in Flow via `$Call`.

**See [src/index.js](src/index.js)**.

---

The repository also contains converter from lambda calculus notation to Flow.

```console
# Example:
$ node ./lc-to-flow.js "λs. \z. s (s (s (s z)))"
```

For haskell version of the converter see [lc-to-flow.hs/](lc-to-flow.hs/).
