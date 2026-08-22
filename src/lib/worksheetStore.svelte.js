import { tick } from 'svelte';

/**
 * @typedef {import('./mathEngine.js').MathCell} MathCell
 */

export const worksheetStore = createWorksheetStore();

function createWorksheetStore() {
  /** @type {number} */
  let idCounter = 0;

  /**
   * Generates a unique cell identifier string.
   * @returns {string}
   */
  function nextId() {
    return 'cell_' + (++idCounter) + '_' + Date.now();
  }

  // Application State
  /** @type {boolean} */
  let isDarkMode = $state(false);

  /** @type {number} */
  let activeIndex = $state(0);

  // Initial Cells
  /** @type {MathCell[]} */
  let cells = $state([
    { id: nextId(), latex: '', mode: 'decimal' }
  ]);

  return {
    get isDarkMode() { return isDarkMode; },
    set isDarkMode(val) { isDarkMode = val; },

    get activeIndex() { return activeIndex; },
    set activeIndex(val) { activeIndex = val; },

    get cells() { return cells; },
    set cells(val) { cells = val; },

    /**
     * Inserts a new math cell after the specified index and shifts focus.
     * @param {number} index - Index after which to insert the new cell.
     * @param {(id: string) => void} focusFn - Callback to focus the cell.
     * @returns {Promise<void>}
     */
    async addCellAfter(index, focusFn) {
      /** @type {MathCell} */
      const newCell = { id: nextId(), latex: '', mode: 'decimal' };
      cells.splice(index + 1, 0, newCell);
      activeIndex = index + 1;
      await tick();
      if (focusFn) focusFn(newCell.id);
    },

    /**
     * Removes a math cell at the specified index.
     * @param {number} index - Index of the cell to remove.
     * @param {(id: string) => void} removeRefFn - Callback to remove the dom ref.
     * @param {(id: string) => void} focusFn - Callback to focus the new active cell.
     * @returns {Promise<void>}
     */
    async removeCell(index, removeRefFn, focusFn) {
      if (cells.length <= 1) {
        // Clear instead of delete if only 1 row remains
        cells[0].latex = '';
        await tick();
        if (focusFn) focusFn(cells[0].id);
        return;
      }
      const targetId = cells[index].id;
      if (removeRefFn) removeRefFn(targetId);
      cells.splice(index, 1);
      const prevIndex = Math.max(0, index - 1);
      activeIndex = prevIndex;
      await tick();
      if (cells[prevIndex] && focusFn) {
        focusFn(cells[prevIndex].id);
      }
    },

    /**
     * Clears all worksheet cells and resets to a single empty row.
     * @param {(id: string) => void} focusFn - Callback to focus the cell.
     * @returns {void}
     */
    clearAll(focusFn) {
      cells = [{ id: nextId(), latex: '', mode: 'decimal' }];
      activeIndex = 0;
      tick().then(() => {
        if (focusFn) focusFn(cells[0].id);
      });
    },

    /**
     * Toggles the display format mode between decimal and fraction for a cell.
     * @param {number} index - Index of the cell.
     * @returns {void}
     */
    toggleDisplayMode(index) {
      const currentMode = cells[index].mode;
      cells[index].mode = currentMode === 'decimal' ? 'fraction' : 'decimal';
    }
  };
}
