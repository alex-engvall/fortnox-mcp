const copyButton = document.querySelector('.copy-button');
const cloneCommand = document.querySelector('#clone-command');
const copyStatus = document.querySelector('.copy-status');

// The page and source command remain usable without JavaScript or clipboard access.
if (copyButton && cloneCommand && copyStatus && window.isSecureContext && navigator.clipboard) {
  copyButton.hidden = false;
  let resetTimeout;

  copyButton.addEventListener('click', async () => {
    clearTimeout(resetTimeout);
    copyButton.disabled = true;
    copyStatus.textContent = '';

    try {
      await navigator.clipboard.writeText(cloneCommand.textContent.trim());
      copyButton.textContent = 'Kopierat';
      copyButton.dataset.copied = '';
      copyStatus.textContent = 'Kommandot har kopierats.';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(cloneCommand);
      selection?.removeAllRanges();
      selection?.addRange(range);
      copyStatus.textContent = 'Kunde inte kopiera automatiskt. Markera kommandot och kopiera manuellt.';
    } finally {
      copyButton.disabled = false;
      resetTimeout = setTimeout(() => {
        copyButton.textContent = 'Kopiera';
        delete copyButton.dataset.copied;
        copyStatus.textContent = '';
      }, 4000);
    }
  });
}
