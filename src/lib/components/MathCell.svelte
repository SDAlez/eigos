<script>
  import 'mathlive';
  import { worksheetStore } from '../worksheetStore.svelte.js';
  import { evaluateExpression } from '../mathEngine.js';

  /** 
   * @typedef {import('../mathEngine.js').MathCell} MathCell
   */

  /** 
   * @type {{ 
   *  cell: MathCell, 
   *  index: number,
   *  isActive: boolean,
   *  onFocusCell: (id: string) => void,
   *  onRemoveRef: (id: string) => void,
   *  onAddRef: (id: string, node: any) => void
   * }} 
   */
  let { cell, index, isActive, onFocusCell, onRemoveRef, onAddRef } = $props();

  let evalResult = $derived.by(() => {
    return evaluateExpression(cell.latex, cell.mode);
  });

  /**
   * Svelte action directive to attach MathLive event handlers and bind values.
   * @param {any} node - The math-field DOM element.
   * @returns {{ destroy: () => void }}
   */
  function setupMathfield(node) {
    onAddRef(cell.id, node);

    /**
     * Synchronize input value with cell state.
     * @param {Event} e
     */
    function handleInput(e) {
      worksheetStore.cells[index].latex = node.value;
    }

    /**
     * Intercept keyboard navigation and commands.
     * @param {KeyboardEvent} e
     */
    function handleKeyDown(e) {
      worksheetStore.activeIndex = index;

      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        worksheetStore.addCellAfter(index, onFocusCell);
      } else if (e.key === 'Backspace' && (!node.value || node.value.trim() === '')) {
        if (worksheetStore.cells.length > 1) {
          e.preventDefault();
          e.stopPropagation();
          worksheetStore.removeCell(index, onRemoveRef, onFocusCell);
        }
      } else if (e.key === 'ArrowDown' && index < worksheetStore.cells.length - 1) {
        if (node.selectionIsAtEnd) {
          e.preventDefault();
          onFocusCell(worksheetStore.cells[index + 1].id);
        }
      } else if (e.key === 'ArrowUp' && index > 0) {
        if (node.selectionIsAtStart) {
          e.preventDefault();
          onFocusCell(worksheetStore.cells[index - 1].id);
        }
      }
    }

    /** Set active index on focus */
    function handleFocus() {
      worksheetStore.activeIndex = index;
    }

    node.addEventListener('input', handleInput);
    node.addEventListener('keydown', handleKeyDown);
    node.addEventListener('focus', handleFocus);

    if (cell.latex) {
      node.value = cell.latex;
    }

    return {
      destroy() {
        node.removeEventListener('input', handleInput);
        node.removeEventListener('keydown', handleKeyDown);
        node.removeEventListener('focus', handleFocus);
        onRemoveRef(cell.id);
      }
    };
  }
</script>

<div 
  class="worksheet-row" 
  class:is-active={isActive}
>
  <!-- Input Math Field -->
  <div class="cell-input-wrapper">
    <span class="cell-index">{index + 1}</span>
    <math-field
      use:setupMathfield
    ></math-field>
  </div>

  <!-- Output Result Section -->
  <div class="cell-output-wrapper">
    {#if evalResult.text !== ''}
      <span class="result-equals">=</span>
      
      <div class="result-value" class:is-error={evalResult.isError}>
        {#if evalResult.isError}
          <span>{evalResult.text}</span>
        {:else if evalResult.isLatex}
          <!-- Render LaTeX formatted output -->
          <math-field read-only static>{evalResult.text}</math-field>
        {:else}
          <span>{evalResult.text}</span>
        {/if}
      </div>

      <!-- Format Toggle (Decimal vs Fraction) -->
      {#if !evalResult.isError}
        <button 
          class="format-toggle-btn" 
          onclick={(e) => { e.stopPropagation(); worksheetStore.toggleDisplayMode(index); }}
          title="Toggle Decimal / Fraction formatting"
        >
          {#if cell.mode === 'decimal'}
            .0
          {:else if cell.mode === 'fraction'}
            ½
          {:else}
            ⁘
          {/if}
        </button>
      {/if}
    {/if}

    <!-- Row Action Delete Button -->
    <div class="row-actions">
      <button 
        class="delete-row-btn" 
        onclick={(e) => { e.stopPropagation(); worksheetStore.removeCell(index, onRemoveRef, onFocusCell); }}
        title="Delete row"
      >
        ✕
      </button>
    </div>
  </div>
</div>

<style>
  .worksheet-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 4.25rem;
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid var(--row-border);
    position: relative;
    transition: all 0.15s ease;
  }

  .worksheet-row:last-child {
    border-bottom: none;
  }

  .worksheet-row.is-active {
    background-color: var(--row-active-bg);
    outline: 2px solid var(--accent-focus-ring);
    outline-offset: -2px;
    z-index: 2;
    box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.1);
  }

  .cell-input-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    min-width: 0;
    padding-right: 1.5rem;
  }

  .cell-index {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--muted-text);
    width: 1.5rem;
    flex-shrink: 0;
    user-select: none;
  }

  math-field {
    width: 100%;
    font-size: 1.35rem;
    background: transparent;
    border: none;
    outline: none;
    box-shadow: none;
    color: var(--primary-text);
    padding: 0.25rem 0;
    --color: var(--primary-text);
    --background: transparent;
    --mathfield-background: transparent;
    --placeholder-color: var(--muted-text);
  }

  math-field::part(content) {
    padding: 0;
  }

  math-field:focus-within {
    outline: none !important;
    box-shadow: none !important;
  }

  .cell-output-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  .result-equals {
    font-family: var(--font-heading);
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--secondary-text);
    user-select: none;
  }

  .result-value {
    font-family: var(--font-mono);
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--primary-text);
    display: flex;
    align-items: center;
  }

  .result-value.is-error {
    color: var(--error-color);
    font-size: 0.9rem;
    font-family: var(--font-sans);
    background-color: var(--error-bg);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }

  .format-toggle-btn {
    background: transparent;
    border: 1px solid var(--card-border);
    color: var(--secondary-text);
    width: 1.85rem;
    height: 1.85rem;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-family: var(--font-mono);
    cursor: pointer;
    transition: all 0.15s ease;
    padding: 0;
  }

  .format-toggle-btn:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
    background-color: var(--accent-light);
  }

  .row-actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    opacity: 0.4;
    transition: opacity 0.15s ease;
  }

  .worksheet-row:hover .row-actions,
  .worksheet-row.is-active .row-actions {
    opacity: 1;
  }

  .delete-row-btn {
    background: transparent;
    border: none;
    color: var(--muted-text);
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    transition: all 0.15s ease;
  }

  .delete-row-btn:hover {
    color: var(--error-color);
    background-color: var(--error-bg);
  }

  @media (max-width: 640px) {
    .worksheet-row {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }
    .cell-output-wrapper {
      justify-content: flex-end;
    }
  }
</style>
