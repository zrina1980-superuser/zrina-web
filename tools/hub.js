'use strict';

(() => {
  const cards = Array.from(document.querySelectorAll('.tool-card'));
  const search = document.getElementById('tool-search');
  const count = document.getElementById('tool-count');
  const filters = Array.from(document.querySelectorAll('.tool-filter'));
  let activeFilter = 'all';

  function updateResults() {
    const query = search.value.trim().toLocaleLowerCase();
    let visibleCount = 0;

    for (const card of cards) {
      const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
      const matchesSearch = !query || card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !(matchesFilter && matchesSearch);
      if (!card.hidden) visibleCount++;
    }

    count.textContent = visibleCount
      ? `${visibleCount} of ${cards.length} tools shown.`
      : 'No tools match your search.';
  }

  for (const button of filters) {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      for (const item of filters) item.setAttribute('aria-pressed', String(item === button));
      updateResults();
    });
  }

  search.addEventListener('input', updateResults);
  updateResults();
})();
