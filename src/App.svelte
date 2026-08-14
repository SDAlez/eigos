<script>
  import { onMount, tick } from 'svelte';
  import 'mathlive';
  import { worksheetStore } from './lib/worksheetStore.svelte.js';
  import Header from './lib/components/Header.svelte';
  import MathCell from './lib/components/MathCell.svelte';
  import Footer from './lib/components/Footer.svelte';

  /** @type {Record<string, any>} */
  let mathfieldRefs = {};

  // Dynamically sync dark theme class to <html> element so full page background updates
  $effect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark-theme', worksheetStore.isDarkMode);
    }
  });

  /**
   * Focuses the math-field element corresponding to the given cell ID.
   * @param {string} id - Cell ID to focus.
   * @returns {void}
   */
  function focusCell(id) {
    const mf = mathfieldRefs[id];
    if (mf && typeof mf.focus === 'function') {
      mf.focus();
    }
  }

  function focusFirstCell() {
    if (worksheetStore.cells.length > 0) {
      focusCell(worksheetStore.cells[0].id);
    }
  }

  function focusLastCell() {
    if (worksheetStore.cells.length > 0) {
      focusCell(worksheetStore.cells[worksheetStore.cells.length - 1].id);
    }
  }

  /**
   * @param {string} id 
   */
  function handleRemoveRef(id) {
    delete mathfieldRefs[id];
  }

  /**
   * @param {string} id 
   * @param {any} node 
   */
  function handleAddRef(id, node) {
    mathfieldRefs[id] = node;
  }

  onMount(() => {
    // Auto-focus first cell on load
    tick().then(focusFirstCell);
  });
</script>

<div class="app-container" class:dark-theme={worksheetStore.isDarkMode}>
  <Header 
    focusFirstCell={focusFirstCell}
    focusLastCell={focusLastCell}
  />

  <main class="notebook-wrapper" role="region" aria-label="Math Worksheet">
    {#each worksheetStore.cells as cell, index (cell.id)}
      <MathCell 
        {cell}
        {index}
        isActive={worksheetStore.activeIndex === index}
        onFocusCell={focusCell}
        onRemoveRef={handleRemoveRef}
        onAddRef={handleAddRef}
      />
    {/each}
  </main>

  <Footer />
</div>
