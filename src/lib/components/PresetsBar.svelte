<script>
  import { worksheetStore } from '../worksheetStore.svelte.js';

  /** @type {{ focusActiveCell: (id: string, latex: string) => void }} */
  let { focusActiveCell } = $props();

  /**
   * @param {string} latex 
   */
  function handlePresetClick(latex) {
    worksheetStore.insertPreset(latex, focusActiveCell);
  }
</script>

<div class="presets-bar">
  <span class="preset-label">Insert Preset:</span>
  {#each worksheetStore.presets as preset}
    <button class="preset-chip" onclick={() => handlePresetClick(preset.latex)}>
      {preset.label}
    </button>
  {/each}
</div>

<style>
  .presets-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
  }

  .preset-label {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted-text);
    margin-right: 0.25rem;
  }

  .preset-chip {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    color: var(--secondary-text);
    font-family: var(--font-mono);
    font-size: 0.8rem;
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .preset-chip:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
    background-color: var(--accent-light);
  }
</style>
