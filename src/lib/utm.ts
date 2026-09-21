export type UtmParams = {
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
};

export const UTM_COOKIE = "ml_utm";
export const SESSION_COOKIE = "ml_session";

export function parseUtmFromSearchParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>
): UtmParams | null {
  const get = (key: string): string | undefined => {
    if (params instanceof URLSearchParams) {
      return params.get(key) ?? undefined;
    }
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const utmSource = get("utm_source");
  const utmMedium = get("utm_medium");
  const utmCampaign = get("utm_campaign");
  const utmTerm = get("utm_term");
  const utmContent = get("utm_content");

  if (!utmSource && !utmMedium && !utmCampaign && !utmTerm && !utmContent) {
    return null;
  }

  return { utmSource, utmMedium, utmCampaign, utmTerm, utmContent };
}

export function serializeUtm(utm: UtmParams): string {
  return JSON.stringify({
    utmSource: utm.utmSource ?? null,
    utmMedium: utm.utmMedium ?? null,
    utmCampaign: utm.utmCampaign ?? null,
    utmTerm: utm.utmTerm ?? null,
    utmContent: utm.utmContent ?? null,
  });
}

export function deserializeUtm(raw: string | undefined | null): UtmParams {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as UtmParams;
    return {
      utmSource: parsed.utmSource ?? null,
      utmMedium: parsed.utmMedium ?? null,
      utmCampaign: parsed.utmCampaign ?? null,
      utmTerm: parsed.utmTerm ?? null,
      utmContent: parsed.utmContent ?? null,
    };
  } catch {
    return {};
  }
}
