(function (w, d) {
  var src = "/mz.forms.js";
  if (d.querySelector('script[data-mz-forms-legacy-loader]')) return;

  var s = d.createElement("script");
  s.src = src;
  s.defer = true;
  s.setAttribute("data-mz-forms-legacy-loader", "1");
  d.head.appendChild(s);
})(window, document);
