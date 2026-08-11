import { ComputeEngine } from '@cortex-js/compute-engine';

/**
 * @typedef {'decimal' | 'fraction' | 'auto'} FormatMode
 * @typedef {{ id: string, latex: string, mode: FormatMode }} MathCell
 * @typedef {{ text: string, isError: boolean, isLatex: boolean, mode: FormatMode }} EvalResult
 * @typedef {{ label: string, latex: string }} MathPreset
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
    return { text: '', isError: false, isLatex: false, mode: 'auto' };
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

    // Check if expression is a matrix or list structure
    const json = exact.json;
    if (Array.isArray(json) && (json[0] === 'Matrix' || json[0] === 'List')) {
      let matrixLatex = exact.latex || '';
      // Format clean bracket matrix output
      matrixLatex = matrixLatex.replace(/\\bigl\\lbrack/g, '[').replace(/\\bigr\\rbrack/g, ']');
      return { text: matrixLatex, isError: false, isLatex: true, mode: 'auto' };
    }

    // Handle numeric evaluation
    if (mode === 'decimal' || typeof numeric.json === 'number') {
      const jsonVal = numeric.json;
      if (typeof jsonVal === 'number') {
        // Format neatly, trim floating point precision artifacts (e.g. 0.30000000000000004 -> 0.3)
        const formattedNum = Number.isInteger(jsonVal) 
          ? jsonVal.toString() 
          : parseFloat(jsonVal.toFixed(8)).toString();
        return { text: formattedNum, isError: false, isLatex: false, mode: 'decimal' };
      }
    }

    // Fallback to exact LaTeX representation
    let fallbackLatex = exact.latex || String(numeric.json || '');
    fallbackLatex = fallbackLatex.replace(/\\,/g, '');
    return { text: fallbackLatex, isError: false, isLatex: true, mode: 'auto' };
  } catch (err) {
    return { text: 'Syntax Error', isError: true, isLatex: false, mode: 'auto' };
  }
}
