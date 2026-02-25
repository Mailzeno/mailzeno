import {
  SendEmailOptions,
  SendEmailResponse
} from "../types"

export interface SendEmailRequestOptions {
  idempotencyKey?: string
}

export type RequestFunction = <TResponse>(
  path: string,
  body: unknown,
  meta?: { idempotencyKey?: string }
) => Promise<TResponse>

export class EmailsResource {
  constructor(private request: RequestFunction) {}

  async send(
    payload: SendEmailOptions,
    options?: SendEmailRequestOptions
  ): Promise<SendEmailResponse> {
    return this.request<SendEmailResponse>(
      "/emails",
      payload,
      {
        idempotencyKey: options?.idempotencyKey
      }
    )
  }
}
