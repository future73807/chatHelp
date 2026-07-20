const releasesUrl = "/api/releases/stable";
const referralClaimsUrl = "/api/referrals/claims";
const referralCode = new URLSearchParams(window.location.search)
  .get("ref")
  ?.trim()
  .toUpperCase();

function validReferralCode(value) {
  return /^[A-Z0-9][A-Z0-9_-]{2,31}$/.test(value || "");
}

function copyReferralClaimToken(claimToken) {
  const textarea = document.createElement("textarea");
  textarea.value = claimToken;
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.append(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } finally {
    textarea.remove();
  }

  void navigator.clipboard?.writeText(claimToken).catch(() => undefined);
}

async function createReferralClaim() {
  if (!validReferralCode(referralCode)) return null;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5_000);
  try {
    const response = await fetch(referralClaimsUrl, {
      body: JSON.stringify({ referral_code: referralCode }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
      signal: controller.signal,
    });
    const result = await response.json();
    if (!response.ok || !result.ok || !result.claim?.claim_token) {
      throw new Error(result.error || `邀请令牌创建失败：${response.status}`);
    }
    return result.claim;
  } finally {
    window.clearTimeout(timeout);
  }
}

function enableDownloadLink(link, url, claimToken) {
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.removeAttribute("aria-disabled");
  if (claimToken) {
    link.addEventListener("click", () => {
      copyReferralClaimToken(claimToken);
    });
  }
}

async function loadDownloadLinks() {
  const claimPromise = createReferralClaim().catch((error) => {
    console.warn("[terln-landing] referral claim is unavailable", error);
    return null;
  });
  const [response, claim] = await Promise.all([
    fetch(releasesUrl),
    claimPromise,
  ]);
  const manifest = await response.json();
  const artifacts = manifest.artifacts["terln-ai-client"];

  for (const link of document.querySelectorAll(".download-link")) {
    const platform = link.dataset.platform;
    const artifact = artifacts.find((item) => item.platform === platform);
    link.querySelector("[data-version]").textContent = artifact?.version
      ? `版本 ${artifact.version}`
      : "版本待配置";

    if (artifact?.download_url) {
      enableDownloadLink(link, artifact.download_url, claim?.claim_token);
    }
  }
}

void loadDownloadLinks().catch((error) => {
  console.error("[terln-landing] failed to load release manifest", error);

  for (const version of document.querySelectorAll("[data-version]")) {
    version.textContent = "版本读取失败";
  }
});
