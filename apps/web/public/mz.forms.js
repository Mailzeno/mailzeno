(function (w, d) {
  var FALLBACK_SERVICE_ORIGIN = "https://mailzeno.dev";
  var KNOWN_STATIC_HOSTS = {
    "cdn.jsdelivr.net": true,
    "raw.githubusercontent.com": true,
    "raw.githack.com": true,
    "unpkg.com": true,
  };

  function resolveDefaultEndpoint() {
    var script = d.currentScript;
    var scriptAttrEndpoint = script &&
      (script.getAttribute("data-mz-endpoint") ||
        script.getAttribute("data-mailzeno-endpoint"));

    if (scriptAttrEndpoint) {
      return scriptAttrEndpoint;
    }

    var globalEndpoint = w.MZ_FORMS_ENDPOINT || w.MAILZENO_FORMS_ENDPOINT;
    if (globalEndpoint) {
      return String(globalEndpoint);
    }

    var scriptSrc = script && script.getAttribute("src");
    if (scriptSrc) {
      try {
        var parsed = new URL(scriptSrc, w.location.href);
        var host = String(parsed.host || "").toLowerCase();

        if (!KNOWN_STATIC_HOSTS[host]) {
          return parsed.origin.replace(/\/$/, "") + "/api/v1/forms/public/submit";
        }
      } catch (_error) {
        // Ignore URL parsing failures and fall back to hosted API origin.
      }
    }

    return FALLBACK_SERVICE_ORIGIN + "/api/v1/forms/public/submit";
  }

  var DEFAULT_ENDPOINT = resolveDefaultEndpoint();
  var SDK_VERSION = "2.1.0";
  var schemaCache = {};

  function toAbsoluteUrl(pathOrUrl) {
    try {
      return new URL(pathOrUrl, w.location.origin).toString();
    } catch (_error) {
      return String(pathOrUrl || "");
    }
  }

  function normalizePayload(payload) {
    if (!payload || typeof payload !== "object") return {};
    return payload;
  }

  function normalizeKey(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  function resolveAliasKey(value) {
    var normalized = normalizeKey(value);
    if (!normalized) return "";

    var aliasGroups = {
      name: ["fullname", "full_name", "yourname", "contactname", "username", "first_name"],
      email: ["emailaddress", "email_address", "mail", "contactemail"],
      phone: ["phonenumber", "phone_number", "mobile", "mobile_number", "telephone", "tel", "contactnumber"],
      company: ["organization", "organisation", "business", "companyname", "company_name"],
      message: ["msg", "comment", "comments", "description", "details", "inquiry", "enquiry"],
      subject: ["topic", "title"],
    };

    var canonicalKeys = Object.keys(aliasGroups);
    for (var i = 0; i < canonicalKeys.length; i += 1) {
      var canonical = canonicalKeys[i];
      if (normalizeKey(canonical) === normalized) return canonical;

      var aliases = aliasGroups[canonical] || [];
      for (var j = 0; j < aliases.length; j += 1) {
        if (normalizeKey(aliases[j]) === normalized) {
          return canonical;
        }
      }
    }

    return "";
  }

  function splitTokens(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }

  function tokenMatchScore(fieldName, candidateKey) {
    var fieldTokens = splitTokens(fieldName);
    var candidateTokens = splitTokens(candidateKey);

    if (fieldTokens.length === 0 || candidateTokens.length === 0) return 0;

    var candidateSet = {};
    candidateTokens.forEach(function (token) {
      candidateSet[token] = true;
    });

    var overlap = 0;
    fieldTokens.forEach(function (token) {
      if (candidateSet[token]) overlap += 1;
    });

    return overlap / Math.max(fieldTokens.length, candidateTokens.length);
  }

  function containsHeuristicMatch(fieldName, candidateKey) {
    var a = normalizeKey(fieldName);
    var b = normalizeKey(candidateKey);

    if (!a || !b) return false;
    if (a.length < 4 && b.length < 4) return false;

    return a.indexOf(b) >= 0 || b.indexOf(a) >= 0;
  }

  function findBestSemanticMatch(fieldName, rawLookup) {
    var best = null;
    var bestScore = 0;

    Object.keys(rawLookup).forEach(function (rawKey) {
      var entry = rawLookup[rawKey];
      if (!entry) return;

      var tokenScore = tokenMatchScore(fieldName, rawKey);
      var containsBoost = containsHeuristicMatch(fieldName, rawKey) ? 0.25 : 0;
      var score = tokenScore + containsBoost;

      if (score > bestScore) {
        bestScore = score;
        best = entry;
      }
    });

    // Keep this strict enough to avoid incorrect remapping.
    return bestScore >= 0.5 ? best : null;
  }

  function editDistance(a, b) {
    var x = String(a || "");
    var y = String(b || "");
    var matrix = [];

    for (var i = 0; i <= y.length; i += 1) {
      matrix[i] = [i];
    }

    for (var j = 0; j <= x.length; j += 1) {
      matrix[0][j] = j;
    }

    for (i = 1; i <= y.length; i += 1) {
      for (j = 1; j <= x.length; j += 1) {
        var cost = y.charAt(i - 1) === x.charAt(j - 1) ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[y.length][x.length];
  }

  function findBestFuzzyMatch(normalizedFieldName, normalizedLookup) {
    var best = null;
    var bestDistance = Number.POSITIVE_INFINITY;

    Object.keys(normalizedLookup).forEach(function (key) {
      var distance = editDistance(normalizedFieldName, key);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = normalizedLookup[key];
      }
    });

    if (!best) return null;

    var maxAllowed = Math.max(1, Math.floor(normalizedFieldName.length * 0.2));
    return bestDistance <= maxAllowed ? best : null;
  }

  function parseJsonSafe(res) {
    return res.json().catch(function () {
      return null;
    });
  }

  function getApiOriginFromEndpoint(endpoint) {
    try {
      var parsed = new URL(endpoint || DEFAULT_ENDPOINT, w.location.origin);
      return parsed.origin.replace(/\/$/, "");
    } catch (_error) {
      return String(FALLBACK_SERVICE_ORIGIN).replace(/\/$/, "");
    }
  }

  function toError(message, status, response) {
    var error = new Error(message || "Form submission failed");
    error.status = status || 0;
    error.response = response || null;
    return error;
  }

  function getMappedFieldName(formEl, sourceKey) {
    var escaped = typeof CSS !== "undefined" && CSS.escape ? CSS.escape(sourceKey) : sourceKey;
    var node = null;

    try {
      node = formEl.querySelector('[name="' + escaped + '"]');
    } catch (_error) {
      node = null;
    }

    if (!node || !node.getAttribute) {
      return sourceKey;
    }

    return (
      node.getAttribute("data-mz-field") ||
      node.getAttribute("data-mailzeno-field") ||
      sourceKey
    );
  }

  function appendValue(target, key, value) {
    if (target[key] === undefined) {
      target[key] = value;
    } else if (Array.isArray(target[key])) {
      target[key].push(value);
    } else {
      target[key] = [target[key], value];
    }
  }

  function formDataToObject(formData, formEl) {
    var data = {};

    formData.forEach(function (value, key) {
      if (typeof value !== "string") return;
      var mappedKey = getMappedFieldName(formEl, key);
      appendValue(data, mappedKey, value);
    });

    return data;
  }

  function mapBySchema(rawData, schemaFields) {
    if (!Array.isArray(schemaFields) || schemaFields.length === 0) {
      return rawData;
    }

    var result = {};
    var consumedKeys = {};

    var exactLookup = {};
    var normalizedLookup = {};
    var rawLookup = {};
    var aliasLookup = {};

    Object.keys(rawData || {}).forEach(function (rawKey) {
      exactLookup[rawKey] = rawData[rawKey];
      normalizedLookup[normalizeKey(rawKey)] = { key: rawKey, value: rawData[rawKey] };
      rawLookup[rawKey] = { key: rawKey, value: rawData[rawKey] };

      var canonicalAlias = resolveAliasKey(rawKey);
      if (canonicalAlias && !aliasLookup[canonicalAlias]) {
        aliasLookup[canonicalAlias] = { key: rawKey, value: rawData[rawKey] };
      }
    });

    schemaFields.forEach(function (field) {
      if (!field || typeof field.name !== "string") return;

      var fieldName = field.name;
      var fieldLabel = typeof field.label === "string" ? field.label : "";

      if (Object.prototype.hasOwnProperty.call(exactLookup, fieldName)) {
        result[fieldName] = exactLookup[fieldName];
        consumedKeys[fieldName] = true;
        return;
      }

      var normalizedFieldName = normalizeKey(fieldName);
      var normalizedLabel = normalizeKey(fieldLabel);

      var byName = normalizedLookup[normalizedFieldName];
      if (byName) {
        result[fieldName] = byName.value;
        consumedKeys[byName.key] = true;
        return;
      }

      var byLabel = normalizedLabel ? normalizedLookup[normalizedLabel] : null;
      if (byLabel) {
        result[fieldName] = byLabel.value;
        consumedKeys[byLabel.key] = true;
        return;
      }

      var aliasFromName = resolveAliasKey(fieldName);
      var aliasFromLabel = resolveAliasKey(fieldLabel);
      var aliasMatch =
        (aliasFromName && aliasLookup[aliasFromName]) ||
        (aliasFromLabel && aliasLookup[aliasFromLabel]) ||
        null;

      if (aliasMatch && !consumedKeys[aliasMatch.key]) {
        result[fieldName] = aliasMatch.value;
        consumedKeys[aliasMatch.key] = true;
        return;
      }

      var fuzzy = findBestFuzzyMatch(normalizedFieldName, normalizedLookup);
      if (fuzzy) {
        result[fieldName] = fuzzy.value;
        consumedKeys[fuzzy.key] = true;
        return;
      }

      var semantic =
        findBestSemanticMatch(fieldName, rawLookup) ||
        (fieldLabel ? findBestSemanticMatch(fieldLabel, rawLookup) : null);
      if (semantic && !consumedKeys[semantic.key]) {
        result[fieldName] = semantic.value;
        consumedKeys[semantic.key] = true;
      }
    });

    Object.keys(rawData || {}).forEach(function (rawKey) {
      if (!consumedKeys[rawKey] && rawKey === "company") {
        result.company = rawData[rawKey];
      }
    });

    return result;
  }

  async function getFormSchema(slug, endpoint) {
    if (!slug) return null;

    var resolvedEndpoint = toAbsoluteUrl(endpoint || DEFAULT_ENDPOINT);
    var cacheKey = resolvedEndpoint + "::" + slug;
    if (schemaCache[cacheKey]) {
      return schemaCache[cacheKey];
    }

    var schemaUrl =
      getApiOriginFromEndpoint(resolvedEndpoint) +
      "/api/v1/forms/" +
      encodeURIComponent(slug);

    var response = await fetch(schemaUrl, {
      method: "GET",
      credentials: "omit",
    });

    if (!response.ok) {
      return null;
    }

    var json = await parseJsonSafe(response);
    var data = json && json.data ? json.data : json;
    var fields = data && Array.isArray(data.fields) ? data.fields : [];

    schemaCache[cacheKey] = fields;
    return fields;
  }

  async function submit(config) {
    if (!config || typeof config !== "object") {
      throw new Error("MZForms.submit requires a config object");
    }

    var publicKey = config.publicKey || config.public_api_key;
    var slug = config.slug || config.formSlug || config.form_slug;

    if (!publicKey && !slug) {
      throw new Error("Provide either publicKey or slug");
    }

    var payload = {
      data: normalizePayload(config.data || {}),
    };

    if (slug) {
      payload.form_slug = String(slug);
    }

    var timeoutMs =
      typeof config.timeoutMs === "number" && config.timeoutMs > 0
        ? config.timeoutMs
        : 15000;

    var endpoint = toAbsoluteUrl(config.endpoint || DEFAULT_ENDPOINT);

    var headers = {
      "Content-Type": "application/json",
    };

    if (publicKey) {
      headers["X-Form-Public-Key"] = String(publicKey);
    }

    var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    var timeoutId = null;

    if (controller) {
      timeoutId = setTimeout(function () {
        controller.abort();
      }, timeoutMs);
    }

    try {
      var res = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
        mode: "cors",
        credentials: "omit",
        signal: controller ? controller.signal : undefined,
      });

      var json = await parseJsonSafe(res);

      if (!res.ok) {
        var message =
          (json && json.error && (json.error.message || json.error)) ||
          "Form submission failed";
        throw toError(message, res.status, json);
      }

      return json;
    } catch (err) {
      if (err && err.name === "AbortError") {
        throw toError("Request timed out", 408, null);
      }

      throw err;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  async function submitForm(formEl, config) {
    if (!formEl || !formEl.tagName || formEl.tagName.toLowerCase() !== "form") {
      throw new Error("submitForm requires a form element");
    }

    var slug =
      (config && (config.slug || config.formSlug || config.form_slug)) ||
      formEl.getAttribute("data-mz-form-slug") ||
      formEl.getAttribute("data-mailzeno-form-slug") ||
      "";

    var formData = new FormData(formEl);
    var rawData = formDataToObject(formData, formEl);
    var data = rawData;

    if (slug) {
      try {
        var schemaFields = await getFormSchema(slug, config && config.endpoint ? String(config.endpoint) : DEFAULT_ENDPOINT);
        data = mapBySchema(rawData, schemaFields || []);
      } catch (_error) {
        data = rawData;
      }
    }

    return submit({
      publicKey:
        (config && (config.publicKey || config.public_api_key)) ||
        formEl.getAttribute("data-mz-public-key") ||
        formEl.getAttribute("data-mailzeno-public-key"),
      slug: slug,
      endpoint:
        (config && config.endpoint) ||
        formEl.getAttribute("data-mz-endpoint") ||
        formEl.getAttribute("data-mailzeno-endpoint") ||
        undefined,
      timeoutMs:
        (config && config.timeoutMs) ||
        Number(
          formEl.getAttribute("data-mz-timeout-ms") ||
          formEl.getAttribute("data-mailzeno-timeout-ms") ||
          15000
        ),
      data: data,
    });
  }

  function getStatusTarget(formEl, attrName, fallbackSelector) {
    var explicitSelector = formEl.getAttribute(attrName);
    if (explicitSelector) {
      try {
        return d.querySelector(explicitSelector);
      } catch (_error) {
        return null;
      }
    }

    var parent = formEl.parentElement;
    return parent ? parent.querySelector(fallbackSelector) : null;
  }

  function setMessageVisibility(el, visible, message) {
    if (!el) return;

    if (typeof message === "string") {
      el.textContent = message;
    }

    if (visible) {
      el.removeAttribute("hidden");
      el.style.display = "";
    } else {
      el.setAttribute("hidden", "hidden");
      el.style.display = "none";
    }
  }

  function autoBind(root) {
    var scope = root || d;
    var forms = scope.querySelectorAll(
      "form[data-mz-public-key], form[data-mailzeno-public-key], form[data-mz-form-slug], form[data-mailzeno-form-slug]"
    );

    forms.forEach(function (formEl) {
      if (formEl.__mzFormsBound) return;
      formEl.__mzFormsBound = true;

      formEl.addEventListener("submit", async function (event) {
        event.preventDefault();

        var submitter = event.submitter;
        if (submitter && submitter.disabled) return;

        var originalText = submitter && submitter.textContent ? submitter.textContent : "";
        if (submitter) {
          submitter.disabled = true;
          if (submitter.dataset && submitter.dataset.loadingText) {
            submitter.textContent = submitter.dataset.loadingText;
          }
        }

        var successTarget =
          getStatusTarget(formEl, "data-mz-success-target", "[data-mz-success]") ||
          getStatusTarget(formEl, "data-mailzeno-success-target", "[data-mailzeno-success]");

        var errorTarget =
          getStatusTarget(formEl, "data-mz-error-target", "[data-mz-error]") ||
          getStatusTarget(formEl, "data-mailzeno-error-target", "[data-mailzeno-error]");

        setMessageVisibility(errorTarget, false);

        try {
          var result = await submitForm(formEl, {});

          var successMessage =
            formEl.getAttribute("data-mz-success-message") ||
            formEl.getAttribute("data-mailzeno-success-message") ||
            "Submitted successfully.";

          setMessageVisibility(successTarget, true, successMessage);

          var shouldReset =
            formEl.getAttribute("data-mz-reset-on-success") ||
            formEl.getAttribute("data-mailzeno-reset-on-success");

          if (shouldReset !== "false") {
            formEl.reset();
          }

          formEl.dispatchEvent(
            new CustomEvent("mz:success", {
              detail: result,
            })
          );

          formEl.dispatchEvent(
            new CustomEvent("mailzeno:success", {
              detail: result,
            })
          );
        } catch (error) {
          var errorMessage =
            (error && error.message) ||
            formEl.getAttribute("data-mz-error-message") ||
            formEl.getAttribute("data-mailzeno-error-message") ||
            "Submission failed";

          setMessageVisibility(errorTarget, true, errorMessage);
          setMessageVisibility(successTarget, false);

          formEl.dispatchEvent(
            new CustomEvent("mz:error", {
              detail: error,
            })
          );

          formEl.dispatchEvent(
            new CustomEvent("mailzeno:error", {
              detail: error,
            })
          );
        } finally {
          if (submitter) {
            submitter.disabled = false;
            if (originalText) submitter.textContent = originalText;
          }
        }
      });
    });
  }

  function init() {
    autoBind(d);
  }

  if (d.readyState === "loading") {
    d.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  var api = {
    submit: submit,
    submitForm: submitForm,
    autoBind: autoBind,
    endpoint: toAbsoluteUrl(DEFAULT_ENDPOINT),
    version: SDK_VERSION,
  };

  w.MZForms = api;
  w.MailZenoForms = api;
})(window, document);
