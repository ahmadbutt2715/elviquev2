const script1 = document.createElement("script");
script1.src = "https://cdn.botpress.cloud/webchat/v3.6/inject.js";
script1.async = true;
document.body.appendChild(script1);

script1.onload = function () {
  const script2 = document.createElement("script");
  script2.src = "https://files.bpcontent.cloud/2026/06/13/20/20260613201732-BTI3OXAF.js";
  script2.async = true;
  document.body.appendChild(script2);
};