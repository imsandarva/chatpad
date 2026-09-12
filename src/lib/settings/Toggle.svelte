<script lang="ts">
  let { checked = false, label, onchange }: { checked?: boolean; label: string; onchange: (on: boolean) => void } = $props();
</script>

<button type="button" class="switch" role="switch" aria-checked={checked} aria-label={label} onclick={() => onchange(!checked)}>
  <span class="knob"></span>
</button>

<style>
  .switch {
    position: relative;
    width: 2.4rem;
    height: 1.4rem;
    padding: 0;
    border: 0;
    border-radius: 999px;
    background: var(--send-disabled);
    cursor: pointer;
    transition: background-color 0.2s var(--ease);
  }

  .switch[aria-checked="true"] {
    background: var(--send);
  }

  .knob {
    position: absolute;
    top: 0.16rem;
    left: 0.16rem;
    width: 1.08rem;
    height: 1.08rem;
    border-radius: 50%;
    background: var(--well);
    box-shadow: 0 1px 2px rgba(26, 25, 22, 0.18);
    transition: transform 0.2s var(--ease);
  }

  .switch[aria-checked="true"] .knob {
    transform: translateX(1rem);
  }

  .switch:active .knob {
    transform: translateX(0.08rem) scale(0.96);
  }

  .switch[aria-checked="true"]:active .knob {
    transform: translateX(0.92rem) scale(0.96);
  }

  .switch:focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }
</style>
