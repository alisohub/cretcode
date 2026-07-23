// GitHub hosted file: bookmarks.js
(function() {
  const urls = [
    "https://example.com",
    "https://example.com/page1",
    "https://example.com/page2"
  ];

  let openedCount = 0;
  urls.forEach(url => {
    const win = window.open(url, '_blank');
    if (win) openedCount++;
  });

  if (openedCount === 0) {
    alert("Pop-up blocker prevented opening tabs. Please allow pop-ups for this site.");
  }
})();
