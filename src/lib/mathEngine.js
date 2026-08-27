import { ComputeEngine } from '@cortex-js/compute-engine';

/**
 * @typedef {'decimal' | 'fraction' | 'auto'} FormatMode
 * @typedef {{ id: string, latex: string, mode: FormatMode }} MathCell
 * @typedef {{ text: string, isError: boolean, isLatex: boolean, mode: FormatMode }} EvalResult
 */

/** @type {ComputeEngine} */
const ce = new ComputeEngine();

/**
 * Helper to extract real and imaginary parts from a numeric ComputeEngine expression.
 * @param {any} numeric - The numeric evaluation result from ComputeEngine.
 * @returns {{ re: number | null, im: number }}
 */
function extractNumeric(numeric) {
  const val = numeric.numericValue;
  let re = null;
  let im = 0;

  if (typeof val === 'number') {
    if (!isNaN(val) && isFinite(val)) {
      re = val;
      im = 0;
    }
  } else if (val && typeof val === 'object') {
    if (typeof val.re === 'number' && !isNaN(val.re) && isFinite(val.re)) {
      re = val.re;
    }
    if (typeof val.im === 'number' && !isNaN(val.im) && isFinite(val.im)) {
      im = val.im;
    }
  }

  return { re, im };
}

/**
 * Formats a real number to standard string, trimming floating point precision artifacts.
 * @param {number} val
 * @returns {string}
 */
function formatReal(val) {
  if (Math.abs(val) < 1e-12) return '0';
  if (Number.isInteger(val)) return val.toString();
  return parseFloat(val.toFixed(8)).toString();
}

/**
 * Formats real and imaginary components into a clean complex number string.
 * @param {number} re
 * @param {number} im
 * @returns {string}
 */
function formatComplex(re, im) {
  const reClean = Math.abs(re) < 1e-12 ? 0 : re;
  const imClean = Math.abs(im) < 1e-12 ? 0 : im;

  if (imClean === 0) {
    return formatReal(reClean);
  }
  if (reClean === 0) {
    if (imClean === 1) return 'i';
    if (imClean === -1) return '-i';
    return `${formatReal(imClean)}i`;
  }

  const reStr = formatReal(reClean);
  if (imClean === 1) return `${reStr} + i`;
  if (imClean === -1) return `${reStr} - i`;
  if (imClean > 0) return `${reStr} + ${formatReal(imClean)}i`;
  return `${reStr} - ${formatReal(Math.abs(imClean))}i`;
}

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
      let exact = parsed.evaluate();
      const numeric = parsed.N();
      const { re, im } = extractNumeric(numeric);

      // Clean precision noise if exact evaluation has floating point artifacts (e.g., i^3, (1+i)^2)
      if (re !== null && (Math.abs(re) < 1e-12 || Math.abs(im) < 1e-12 || (Number.isInteger(re) && Number.isInteger(im)))) {
        if (exact.latex && (exact.latex.includes('10^{-') || exact.latex.includes('e-'))) {
          exact = numeric;
        }
      }

      // If exact evaluation collapsed completely into a raw Complex decimal tuple, 
      // format it neatly using formatComplex to ensure 8-decimal precision and plain text typeface.
      if (exact.json && Array.isArray(exact.json) && exact.json[0] === 'Complex') {
        if (re !== null) {
          return { text: formatComplex(re, im), isError: false, isLatex: false, mode: 'fraction' };
        }
      }

      let exactLatex = exact.latex || '';
      // Clean formatting artifacts like space delimiters
      exactLatex = exactLatex.replace(/\\,/g, '').replace(/\\ /g, '');
      if (!exactLatex || exactLatex === '\\operatorname{NaN}' || exactLatex === 'NaN') {
        return { text: '⚠️', isError: true, isLatex: false, mode: 'fraction' };
      }

      const isPlainNumber = /^-?\d+(?:\.\d+)?$/.test(exactLatex);
      return { text: exactLatex, isError: false, isLatex: !isPlainNumber, mode: 'fraction' };
    }

    // Default or Decimal mode
    const numeric = parsed.N();
    const { re, im } = extractNumeric(numeric);

    // Handle numeric evaluation (real and complex numbers)
    if (re !== null) {
      const formattedNum = formatComplex(re, im);
      return { text: formattedNum, isError: false, isLatex: false, mode: 'decimal' };
    }

    // Fallback when evaluation does not produce a valid numeric or complex value
    return { text: '⚠️', isError: true, isLatex: false, mode: 'decimal' };
  } catch (err) {
    return { text: '⚠️', isError: true, isLatex: false, mode: 'decimal' };
  }
}
