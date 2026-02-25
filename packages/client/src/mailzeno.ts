import { EmailsResource } from "./resources/emails";
import { MailZenoError } from "./errors";

export interface MailZenoOptions {
  baseUrl?: string;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  fetch?: typeof fetch;
}

export class MailZeno {
  private apiKey: string;
  private baseUrl: string;
  private retries: number;
  private retryDelay: number;
  private timeout: number;
  private fetchImpl: typeof fetch;
  private apiVersion = "v1";

  public emails: EmailsResource;

  constructor(apiKey: string, options?: MailZenoOptions) {
    if (!apiKey) {
      throw new MailZenoError("MailZeno API key is required");
    }

    this.apiKey = apiKey;
    this.baseUrl = (options?.baseUrl || "https://api.mailzeno.dev").replace(
      /\/+$/,
      "",
    );
    this.retries = options?.retries ?? 2;
    this.retryDelay = options?.retryDelay ?? 500;
    this.timeout = options?.timeout ?? 10_000;
    this.fetchImpl =
      options?.fetch ??
      (typeof fetch !== "undefined"
        ? fetch
        : ((() => {
            throw new MailZenoError(
              "No fetch implementation found. Provide one in options.",
            );
          }) as typeof fetch));

    this.emails = new EmailsResource(this.request.bind(this));
  }

  private async request<T>(
    path: string,
    body: unknown,
    meta?: { idempotencyKey?: string },
  ): Promise<T> {
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await this.fetchImpl(
          `${this.baseUrl}/${this.apiVersion}${path}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.apiKey}`,
              ...(meta?.idempotencyKey && {
                "Idempotency-Key": meta.idempotencyKey,
              }),
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          },
        );

        clearTimeout(timeoutId);

        let data: any = null;
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          data = await response.json();
        }

        const requestId = response.headers.get("x-request-id") ?? undefined;

        if (!response.ok) {
          const shouldRetry =
            (response.status >= 500 || response.status === 429) &&
            attempt < this.retries;

          if (shouldRetry) {
           

            const retryAfterHeader = response.headers.get("retry-after");

            let delay: number;

            if (retryAfterHeader) {
              const retrySeconds = parseInt(retryAfterHeader, 10);
              delay = isNaN(retrySeconds)
                ? this.retryDelay * (attempt + 1)
                : retrySeconds * 1000;
            } else {
              delay = this.retryDelay * (attempt + 1);
            }

            await this.sleep(delay + Math.random() * 200);
            continue;
          }

          throw new MailZenoError(
            data?.error || "MailZeno API request failed",
            {
              status: response.status,
              code: data?.code,
              requestId,
            },
          );
        }

        return (data ?? {}) as T;
      } catch (error: any) {
        clearTimeout(timeoutId);

        if (error?.name === "AbortError") {
          throw new MailZenoError("Request timed out", {
            status: 408,
          });
        }

        if (attempt < this.retries) {
          await this.sleep(this.retryDelay * attempt + Math.random() * 200);
          continue;
        }

        throw new MailZenoError("Network error");
      }
    }

    throw new MailZenoError("MailZeno API request failed after all retries");
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
