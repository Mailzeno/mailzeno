export class EmailError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EmailError'
  }
}

export class SMTPConnectionError extends EmailError {
  constructor(message: string = 'Failed to connect to SMTP server') {
    super(message)
    this.name = 'SMTPConnectionError'
  }
}

export class InvalidEmailError extends EmailError {
  constructor(message: string = 'Invalid email address') {
    super(message)
    this.name = 'InvalidEmailError'
  }
}

export class TemplateNotFoundError extends EmailError {
  constructor(message: string = 'Email template not found') {
    super(message)
    this.name = 'TemplateNotFoundError'
  }
}

export class SMTPConfigError extends EmailError {
  constructor(message: string = 'Invalid SMTP configuration') {
    super(message)
    this.name = 'SMTPConfigError'
  }
}
