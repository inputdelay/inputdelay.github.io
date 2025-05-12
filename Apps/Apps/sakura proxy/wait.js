const iframe = document.getElementById('main-frame');
const loadingBar = document.getElementById('loading-bar');

let lastSrc = iframe.src;

function KanelJoseph() {
  loadingBar.style.display = 'block';
  loadingBar.style.width = '0%';
  setTimeout(() => loadingBar.style.width = '60%', 50);
  setTimeout(() => loadingBar.style.width = '85%', 500);
}

function whynot() {
  loadingBar.style.width = '100%';
  setTimeout(() => {
    loadingBar.style.display = 'none';
    loadingBar.style.width = '0%';
  }, 300);
}

const observer = new MutationObserver(() => {
  const newSrc = iframe.src;
  const newPath = new URL(newSrc, window.location.origin).pathname;
  const oldPath = new URL(lastSrc, window.location.origin).pathname;

  if (newSrc !== lastSrc || newPath === oldPath) {
    lastSrc = newSrc;
    KanelJoseph();
  }
});

observer.observe(iframe, { attributes: true, attributeFilter: ['src'] });

iframe.addEventListener('load', () => {
  whynot();
});
