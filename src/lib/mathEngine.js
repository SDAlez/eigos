import { ComputeEngine } from '@cortex-js/compute-engine';

/**
 * @typedef {'decimal' | 'fraction' | 'auto'} FormatMode
 * @typedef {{ id: string, latex: string, mode: FormatMode }} MathCell
 * @typedef {{ text: string, isError: boolean, isLatex: boolean, mode: FormatMode }} EvalResult
 */

/** @type {ComputeEngine} */
const ce = new ComputeEngine();

/**
 * Evaluates a LaTeX expression string using CortexJS ComputeEngine.
 * @param {string} latexStr - The LaTeX string to evaluate.
 * @param {FormatMode} mode - The display format mode.
 * @returns {EvalResult}
 */
export function evaluateExpression(latexStr, mode) {
  if (!latexStr || !latexStr.trim()) {
    return { text: '', isError: false, isLatex: false, mode: 'decimal' };
  }

  try {
    const parsed = ce.parse(latexStr);
    
    // If mode is forced fraction
    if (mode === 'fraction') {
      const exact = parsed.evaluate();
      let exactLatex = exact.latex || '';
      // Clean formatting artifacts like space delimiters
      exactLatex = exactLatex.replace(/\\,/g, '').replace(/\\ /g, '');
      return { text: exactLatex, isError: false, isLatex: true, mode: 'fraction' };
    }

    // Default or Decimal mode
    const numeric = parsed.N();
    const exact = parsed.evaluate();

    // Extract numeric value if available (handling numbers, Decimal objects, and irrational constants)
    /** @type {number | null} */
    let numVal = null;
    if (typeof numeric.json === 'number') {
      numVal = numeric.json;
    } else if (numeric.json && typeof numeric.json === 'object' && 'num' in numeric.json && typeof numeric.json.num === 'string') {
      const parsedNum = parseFloat(numeric.json.num);
      if (!isNaN(parsedNum)) numVal = parsedNum;
    }

    // Handle numeric evaluation
    if (numVal !== null) {
      // Format neatly, trim floating point precision artifacts (e.g. 0.30000000000000004 -> 0.3)
      const formattedNum = Number.isInteger(numVal) 
        ? numVal.toString() 
        : parseFloat(numVal.toFixed(8)).toString();
      return { text: formattedNum, isError: false, isLatex: false, mode: 'decimal' };
    }

    // Fallback when evaluation does not produce a real number (e.g. complex numbers, undefined, or symbolic)
    return { text: '⚠️', isError: true, isLatex: false, mode: 'decimal' };
  } catch (err) {
    return { text: '⚠️', isError: true, isLatex: false, mode: 'decimal' };
  }
}
