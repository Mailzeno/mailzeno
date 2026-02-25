# MailZeno Documentation App

This directory contains the official MailZeno documentation application.

The app renders the MDX documentation source located in `/content/docs`
and powers the public documentation site:

https://docs.mailzeno.dev

---

## Overview

The documentation app is a Next.js application built to provide:

- MDX-based documentation rendering
- Dynamic routing (`[slug]`)
- Table of contents generation
- Syntax highlighting
- Versioned API documentation
- Clean developer-focused UI
- SEO-optimized static generation

The actual documentation content lives in:

/content/docs

---

## Architecture

- Framework: Next.js (App Router)
- Content: MDX
- Styling: Tailwind CSS
- Dynamic routing: `/[slug]`
- Client components for TOC and interactive elements
- Static generation where possible

The app is designed to remain lightweight and content-driven.

---

## Purpose

The documentation app exists to:

- Provide a developer-first onboarding experience
- Ensure API behavior is clearly documented
- Keep documentation tightly coupled with real API implementation
- Maintain transparency around MailZeno architecture

---

## Development

To run the documentation app locally:

1. Install dependencies
2. Run the development server

```bash
npm install
npm run dev