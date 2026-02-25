import { buildEmailTemplate } from "./email-layout";

export type StarterTemplate = {
  id: string;
  name: string;
  subject: string;
  category:
    | "onboarding"
    | "security"
    | "marketing"
    | "business"
    | "transactional";
  body: string;
};

export const starterTemplates: StarterTemplate[] = [
  
  // onboarding

  {
    id: "welcome",
    name: "Welcome",
    category: "onboarding",
    subject: "Welcome to {{company}}, {{name}} 🚀",
    body: buildEmailTemplate({
      theme: "indigo",
      title: "Welcome to {{company}}",
      subtitle: "Let’s get you set up for success",
      content: `
        <p>Hi {{name}},</p>

        <p>We're excited to have you join <strong>{{company}}</strong>.</p>

        <div style="background:#f9fafb;padding:16px;border-radius:8px;margin:20px 0;">
          <strong>Here’s what you can do next:</strong>
          <ul style="margin:10px 0 0 20px;">
            <li>Complete your profile</li>
            <li>Explore core features</li>
            <li>Invite your team</li>
          </ul>
        </div>

        <p>If you need any assistance, our support team is always here to help.</p>
      `,
      buttonText: "Start Exploring",
      buttonUrl: "{{cta_url}}",
    }),
  },

  {
    id: "onboarding-checklist",
    name: "Onboarding Checklist",
    category: "onboarding",
    subject: "Your setup checklist inside ✅",
    body: buildEmailTemplate({
      theme: "blue",
      title: "Complete Your Setup",
      subtitle: "Just a few more steps",
      content: `
        <p>Hello {{name}},</p>

        <p>You're almost ready! Here’s your onboarding progress:</p>

        <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0;">
          ✔ Account Created <br/>
          ✔ Email Verified <br/>
          ⏳ Complete Profile <br/>
          ⏳ Connect Integration
        </div>

        <p>Complete the remaining steps to unlock full access.</p>
      `,
      buttonText: "Complete Setup",
      buttonUrl: "{{cta_url}}",
    }),
  },

  // security

  {
    id: "email-verification",
    name: "Email Verification",
    category: "security",
    subject: "Action required: Verify your email",
    body: buildEmailTemplate({
      theme: "red",
      title: "Verify Your Email Address",
      subtitle: "Secure your account",
      content: `
        <p>Hello {{name}},</p>

        <p>To activate your account, please confirm your email address.</p>

        <p>This helps us keep your account secure and protected.</p>

        <div style="background:#fef2f2;padding:14px;border-radius:6px;margin-top:20px;">
          This verification link will expire in <strong>24 hours</strong>.
        </div>
      `,
      buttonText: "Verify Email",
      buttonUrl: "{{verification_link}}",
    }),
  },

  {
    id: "password-reset",
    name: "Password Reset",
    category: "security",
    subject: "Reset your password",
    body: buildEmailTemplate({
      theme: "orange",
      title: "Password Reset Request",
      subtitle: "We received a reset request",
      content: `
        <p>Hi {{name}},</p>

        <p>We received a request to reset your password.</p>

        <p>If this was you, click below to create a new password.</p>

        <p>If you did not request this, you can safely ignore this email.</p>
      `,
      buttonText: "Reset Password",
      buttonUrl: "{{reset_link}}",
    }),
  },

//  Marketing

  {
    id: "feature-launch",
    name: "New Feature Launch",
    category: "marketing",
    subject: "Introducing {{feature_name}} ✨",
    body: buildEmailTemplate({
      theme: "pink",
      title: "Meet {{feature_name}}",
      subtitle: "Built to make your workflow faster",
      content: `
        <p>Hello {{name}},</p>

        <p>We just launched <strong>{{feature_name}}</strong> — designed to help you:</p>

        <ul>
          <li>Save time</li>
          <li>Increase productivity</li>
          <li>Improve collaboration</li>
        </ul>

        <p>Experience it today and let us know what you think!</p>
      `,
      buttonText: "Try It Now",
      buttonUrl: "{{feature_url}}",
    }),
  },

  {
    id: "limited-offer",
    name: "Limited Time Offer",
    category: "marketing",
    subject: "Exclusive 30% discount ends soon 🔥",
    body: buildEmailTemplate({
      theme: "green",
      title: "Limited Time Offer",
      subtitle: "Save 30% today",
      content: `
        <p>Hi {{name}},</p>

        <p>For a limited time, upgrade your plan and save <strong>30%</strong>.</p>

        <div style="background:#ecfdf5;padding:16px;border-radius:8px;margin:20px 0;">
          Use code: <strong>{{discount_code}}</strong>
        </div>

        <p>Offer valid until {{expiry_date}}.</p>
      `,
      buttonText: "Upgrade & Save",
      buttonUrl: "{{upgrade_link}}",
    }),
  },
  
  // Testimonials

  {
    id: "invoice-receipt",
    name: "Invoice Receipt",
    category: "transactional",
    subject: "Your invoice from {{company}}",
    body: buildEmailTemplate({
      theme: "green",
      title: "Payment Successful",
      subtitle: "Thank you for your purchase",
      content: `
        <p>Hello {{name}},</p>

        <p>Your payment of <strong>{{amount}}</strong> has been successfully processed.</p>

        <div style="border:1px solid #e5e7eb;padding:16px;border-radius:8px;margin-top:20px;">
          <strong>Transaction ID:</strong> {{transaction_id}} <br/>
          <strong>Date:</strong> {{date}}
        </div>

        <p>If you have any questions, feel free to contact support.</p>
      `,
    }),
  },

  /* BUSINESS */

  {
    id: "meeting-confirmation-pro",
    name: "Meeting Confirmation Pro",
    category: "business",
    subject: "Meeting confirmed for {{date}}",
    body: buildEmailTemplate({
      theme: "blue",
      title: "Meeting Confirmed",
      subtitle: "We look forward to speaking with you",
      content: `
        <p>Hello {{name}},</p>

        <p>Your meeting has been successfully scheduled.</p>

        <div style="background:#f0f9ff;padding:16px;border-radius:8px;margin:20px 0;">
          <strong>Date:</strong> {{date}} <br/>
          <strong>Time:</strong> {{time}} <br/>
          <strong>Location:</strong> {{location}}
        </div>

        <p>Please let us know if you need to reschedule.</p>
      `,
      buttonText: "Add to Calendar",
      buttonUrl: "{{calendar_link}}",
    }),
  },
];
