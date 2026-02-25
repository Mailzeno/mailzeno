import React from "react"
import { render } from "@react-email/render"
import { RenderError } from "../errors"

export async function renderReact(component: React.ReactElement) {
  try {
    const html = await render(component)
    return { html }
  } catch (err: any) {
    throw new RenderError("React email rendering failed", err)
  }
}
