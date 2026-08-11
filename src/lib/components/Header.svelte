<script>
  import { worksheetStore } from '../worksheetStore.svelte.js';

  /** @type {{ focusFirstCell: () => void, focusLastCell: () => void }} */
  let { focusFirstCell, focusLastCell } = $props();

  function toggleTheme() {
    worksheetStore.isDarkMode = !worksheetStore.isDarkMode;
  }

  function handleClear() {
    worksheetStore.clearAll(focusFirstCell);
  }

  function handleAddRow() {
    worksheetStore.addCellAfter(worksheetStore.cells.length - 1, focusLastCell);
  }
</script>

<header class="app-header">
  <div class="brand-section">
    <span class="logo-badge">EIGOS</span>
    <div>
      <h1 class="app-title">Math Notebook</h1>
      <p class="app-subtitle">Interactive LaTeX expression evaluator</p>
    </div>
  </div>

  <div class="header-actions">
    <button 
      class="icon-btn" 
      onclick={toggleTheme}
      title="Toggle Light/Dark Theme"
    >
      {#if worksheetStore.isDarkMode}
        ☀️ Light
      {:else}
        🌙 Dark
      {/if}
    </button>

    <button class="icon-btn" onclick={handleClear} title="Clear Worksheet">
      🗑️ Clear
    </button>

    <button class="primary-btn" onclick={handleAddRow}>
      ＋ Add Row
    </button>
  </div>
</header>

<style>
  .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--card-border);
  }

  .brand-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .logo-badge {
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    color: #ffffff;
    font-family: var(--font-heading);
    font-weight: 700;
    font-size: 1.1rem;
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    letter-spacing: 0.5px;
  }

  .app-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--primary-text);
  }

  .app-subtitle {
    font-size: 0.875rem;
    color: var(--secondary-text);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .icon-btn {
    background: transparent;
    border: 1px solid var(--card-border);
    color: var(--secondary-text);
    padding: 0.45rem 0.75rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.15s ease;
  }

  .icon-btn:hover {
    background-color: var(--row-hover);
    color: var(--primary-text);
    border-color: var(--secondary-text);
  }

  .primary-btn {
    background-color: var(--accent-color);
    border: 1px solid var(--accent-color);
    color: #ffffff;
    padding: 0.45rem 0.9rem;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    box-shadow: var(--shadow-sm);
    transition: all 0.15s ease;
  }

  .primary-btn:hover {
    filter: brightness(1.1);
    box-shadow: var(--shadow-md);
  }

  @media (max-width: 640px) {
    .app-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
  }
</style>
