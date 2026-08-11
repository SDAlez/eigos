<footer class="notebook-footer">
  <div class="keyboard-hints">
    <span><kbd class="kbd-badge">Enter</kbd> Add next row</span>
    <span><kbd class="kbd-badge">Backspace</kbd> Delete empty row</span>
    <span><kbd class="kbd-badge">↑ / ↓</kbd> Navigate rows</span>
  </div>
  <div>
    <span>Eigos Math Engine</span>
  </div>
</footer>

<style>
  .notebook-footer {
    margin-top: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8rem;
    color: var(--secondary-text);
  }

  .keyboard-hints {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .kbd-badge {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    color: var(--primary-text);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    padding: 0.1rem 0.4rem;
    border-radius: 4px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  }
</style>
