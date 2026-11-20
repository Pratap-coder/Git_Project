const SFDCFormHandler = (() => {
  let apiBaseUrl = null;
  let pendingForm = null;
  const RECAPTCHA_RESPONSE = "g-recaptcha-response";
  const RECAPTCHA_CLASS = ".g-recaptcha";
  const UMA_FORM_SELECTOR = 'form[data-uma-forms="true"]';
  const isSalesforceConsentEnabled = () =>
    typeof SalesforceInteractions !== "undefined" &&
    SalesforceInteractions.currentConsentOptInExists();
  const getAnonymousId = () =>
    isSalesforceConsentEnabled() ? SalesforceInteractions.getAnonymousId() : "";
  const buildApiUrl = (formId) =>
    `${apiBaseUrl.replace(/\/$/, "")}/services/data/v65.0/connect/form-handler/${formId}/submit`;
  const logError = (message) => console.error(`SFDCFormHandler: ${message}`);
  const logInfo = (message) => console.info(`SFDCFormHandler: ${message}`);
  function handleFormHandlerSubmit(formElement, recaptchaToken) {
    const formData = new FormData(formElement);
    const dataObject = {};
    const formId = formElement.id;
    if (!formId) {
      logError("formId is not present.");
      return false;
    }
    for (const [key, value] of formData.entries()) {
      if (Object.prototype.hasOwnProperty.call(dataObject, key)) {
        if (!Array.isArray(dataObject[key])) {
          dataObject[key] = [dataObject[key]];
        }
        dataObject[key].push(value);
      } else {
        dataObject[key] = value;
      }
    }
    delete dataObject[RECAPTCHA_RESPONSE];
    if (typeof apiBaseUrl !== "string" || !apiBaseUrl) {
      logInfo("API base URL (apiBaseUrl) is not set.");
      return false;
    }
    const apiUrl = buildApiUrl(formId);
    const payload = { formData: dataObject, uniqueId: getAnonymousId() };
    if (recaptchaToken) payload.token = recaptchaToken;
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json().catch(() => ({}));
      })
      .then((data) => {
        if (data && data.redirectUrl) {
          window.open(data.redirectUrl, "_blank");
        }
      })
      .catch((error) => logError(`API error: ${error}`));
    return false;
  }
  function engagementEvents() {
    if (!isSalesforceConsentEnabled()) {
      logInfo("Data Cloud Web SDK not available or consent not enabled");
      return;
    }
    SalesforceInteractions.sendEvent({
      interaction: {
        name: "form-handler-submit",
        eventType: "website",
        screenHeight: window.screen.height,
        screenWidth: window.screen.width,
        sourcePageTitle: document.title,
        sourceDomainName: window.location.hostname,
      },
      source: {
        locale: navigator.language,
        pageType: "standard__externalWebPage",
      },
      user: { attributes: { eventType: "identity", isAnonymous: "1" } },
    });
  }
  function onRecaptchaSuccess(token) {
    if (pendingForm) {
      handleFormHandlerSubmit(pendingForm, token);
      pendingForm = null;
    }
  }
  function onFormSubmit(e, form) {
    engagementEvents();
    const recaptchaWidget = form.querySelector(RECAPTCHA_CLASS);
    if (recaptchaWidget) {
      const isInvisible =
        recaptchaWidget.getAttribute("data-size") === "invisible";
      e.preventDefault();
      if (isInvisible) {
        pendingForm = form;
        grecaptcha.execute();
      } else {
        const token = grecaptcha.getResponse();
        handleFormHandlerSubmit(form, token);
      }
      return;
    }
    var result = handleFormHandlerSubmit(form);
    if (result === false) e.preventDefault();
  }
  function init(path) {
    apiBaseUrl = path;
    if (isSalesforceConsentEnabled()) SalesforceInteractions.init();
  }
  function setupForms() {
    document.querySelectorAll(UMA_FORM_SELECTOR).forEach((form) => {
      form.addEventListener("submit", (e) => onFormSubmit(e, form));
    });
  }
  function initializeForms() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", setupForms);
    } else {
      setupForms();
    }
  }
  initializeForms();
  return { init: init, onRecaptchaSuccess: onRecaptchaSuccess };
})();
window.onRecaptchaSuccess = SFDCFormHandler.onRecaptchaSuccess;
