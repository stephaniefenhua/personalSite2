/**
 * Home page typing effect. Runs after content.json is loaded (contentReady).
 */
(function () {
  var typingElement = document.getElementById("typing");
  if (!typingElement) return;

  function runTyping() {
    var text = (window.__content && window.__content.home && window.__content.home.typingText) || "hello! i'm steph.";
    var i = 0;
    typingElement.textContent = "";
    function type() {
      if (i < text.length) {
        typingElement.textContent += text.charAt(i);
        i++;
        setTimeout(type, 100);
      } else {
        setTimeout(function () {
          typingElement.style.animation = "fadeOutCursor 0.8s forwards";
        }, 1500);
      }
    }
    setTimeout(type, 300);
  }

  if (window.__content) runTyping();
  else window.addEventListener("contentReady", runTyping);
})();
