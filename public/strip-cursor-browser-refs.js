(() => {
  const strip = (root = document) => {
    root.querySelectorAll?.("[data-cursor-ref]").forEach((node) => {
      node.removeAttribute("data-cursor-ref");
    });
  };

  strip();

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName === "data-cursor-ref") {
        mutation.target.removeAttribute("data-cursor-ref");
      }

      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) strip(node);
      });
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ["data-cursor-ref"],
  });

  window.setTimeout(() => observer.disconnect(), 8000);
})();
