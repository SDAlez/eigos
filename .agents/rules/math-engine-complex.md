# Math Engine & CortexJS ComputeEngine Architecture Guidelines

This rule outlines the core architectural principles, quirks, and handling of **Complex Numbers**, **MathJSON**, and **Precision Noise** in `src/lib/mathEngine.js`.

---

## 1. Internal Complex Number Structure (`numericValue`)

When evaluating an expression numerically with `.N()`, ComputeEngine outputs a `numericValue` object. Its internal structure is **asymmetric**:

* **Real Part (`re`)**: ComputeEngine supports arbitrary-precision arithmetic for real numbers. Modern `BoxedComplex` objects have a built-in `val.re` getter that automatically returns a primitive JavaScript float, unwrapping any arbitrary precision `Decimal` object (stored in `val.decimal`).
* **Imaginary Part (`im`)**: ComputeEngine **does not** support arbitrary-precision `Decimal` objects for imaginary parts. The imaginary part is always evaluated into a standard 64-bit IEEE float, stored directly in `val.im`.

Therefore, `extractNumeric()` safely extracts the real component from `val.re` (or primitive `number`) and the imaginary component directly from `val.im`.

---

## 2. Exact Evaluation & Complex Number Collapsing

ComputeEngine provides `.evaluate()` (exact symbolic evaluation) and `.N()` (numeric approximation).

* **Real Numbers**: Exact operations on real numbers remain symbolic (e.g. `1 + \sqrt{2}` stays `1 + \sqrt{2}`).
* **Arithmetic Complex Numbers**: The moment an arithmetic operation (fractions, square roots) is multiplied by or added to the imaginary unit `i`, ComputeEngine coerces the expression into its internal tuple `["Complex", re, im]`. Because this tuple only holds floating-point numbers, it eagerly collapses exact fractions and roots into 15-decimal strings:
  * `\sqrt{2} + \sqrt{2}i` $\rightarrow$ `["Complex", {"num":"1.414..."}, 1.414...]`
  * `\frac{1}{3} + i` $\rightarrow$ `["Complex", {"num":"0.333..."}, 1]`
* **Symbolic Constants**: Purely symbolic constants (like $\pi$ or $e$) are preserved algebraically as an `Add` tree (e.g., `\pi + i` $\rightarrow$ `["Add", ["Complex", 0, 1], "Pi"]`).

---

## 3. Fraction Mode vs. Decimal Mode Behavior

* **Decimal Mode**: Exclusively calls `parsed.N()` and runs the output through `formatComplex(re, im)`, enforcing 8-decimal precision and plain-text (`isLatex: false`) rendering.
* **Fraction Mode**: Uses `parsed.evaluate()` to preserve symbols like fractions and $\pi$.
  * **Complex Decimal Interceptor**: When an exact evaluation collapses entirely into a raw `["Complex", ...]` tuple (meaning symbolic fraction representation was lost), the engine intercepts it and passes it through `formatComplex(re, im)` with `isLatex: false`. This ensures that toggling between Fraction and Decimal modes does not cause typeface jumps or unrounded 15-decimal artifacts.

---

## 4. Precision Noise & The `1e-12` Epsilon

Floating-point operations in JavaScript IEEE-754 numbers produce microscopic roundoff residue (around $10^{-15}$ to $10^{-16}$). In exact evaluation mode, operations like $i^3$ or $(1+i)^2$ can produce scientific notation residue (e.g., `"-3965074919248209\cdot 10^{-36} - i"`).

* **Epsilon Threshold (`1e-12`)**: Any component with an absolute value $< 10^{-12}$ is treated as precision noise.
* **Fallback Swap**: If precision noise is detected and `exact.latex` contains scientific notation (`10^{-` or `e-`), the engine replaces `exact` with `numeric = parsed.N()`, leveraging ComputeEngine's numeric rounding heuristics to display clean results (e.g. `"-i"`).
