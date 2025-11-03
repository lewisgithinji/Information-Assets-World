/**
 * Email Templates for Automated Lead Responses
 *
 * Each inquiry type gets a customized email template
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface EmailData {
  leadName: string;
  leadEmail: string;
  eventTitle: string;
  eventStartDate: string;
  eventEndDate: string;
  eventLocation: string;
  eventDescription?: string;
  eventCategory?: string;
  organizationName: string;
  referenceNumber: string;
}

/**
 * Base email wrapper with branding
 */
const emailWrapper = (content: string, leadName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .email-container {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
    }
    .content {
      margin-bottom: 30px;
    }
    .event-card {
      background-color: #f8fafc;
      border-left: 4px solid #2563eb;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .event-title {
      font-size: 18px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 10px;
    }
    .event-detail {
      margin: 8px 0;
      color: #64748b;
    }
    .event-detail-label {
      font-weight: 600;
      color: #475569;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: white !important;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      margin-top: 30px;
      font-size: 12px;
      color: #64748b;
    }
    .reference {
      background-color: #fef3c7;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">📚 Information Assets Training</div>
    </div>

    <div class="content">
      <p>Dear ${leadName},</p>
      ${content}
    </div>

    <div class="footer">
      <p>Best regards,<br>
      <strong>Information Assets Training Team</strong></p>

      <p style="margin-top: 20px; font-size: 11px; color: #94a3b8;">
        This is an automated response to your inquiry. If you have any questions, please reply to this email.<br>
        © ${new Date().getFullYear()} Information Assets. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Generate event details card HTML
 */
const eventDetailsCard = (data: EmailData): string => `
  <div class="event-card">
    <div class="event-title">${data.eventTitle}</div>
    <div class="event-detail">
      <span class="event-detail-label">📅 Date:</span>
      ${formatDate(data.eventStartDate)}${data.eventEndDate !== data.eventStartDate ? ' - ' + formatDate(data.eventEndDate) : ''}
    </div>
    <div class="event-detail">
      <span class="event-detail-label">📍 Location:</span> ${data.eventLocation}
    </div>
    ${data.eventCategory ? `
    <div class="event-detail">
      <span class="event-detail-label">🏷️ Category:</span> ${data.eventCategory}
    </div>
    ` : ''}
    ${data.eventDescription ? `
    <div class="event-detail" style="margin-top: 15px;">
      ${data.eventDescription}
    </div>
    ` : ''}
  </div>

  <div class="reference">
    <strong>Reference Number:</strong> ${data.referenceNumber}<br>
    <small>Please quote this number in all future correspondence.</small>
  </div>
`;

/**
 * TEMPLATE 1: Send Event Writeup/Invitation
 */
export const sendWriteupTemplate = (data: EmailData): EmailTemplate => {
  const content = `
    <p>Thank you for your interest in our upcoming event!</p>

    <p>As requested, please find below the detailed information about the event you're interested in:</p>

    ${eventDetailsCard(data)}

    <h3 style="color: #1e40af; margin-top: 30px;">What's Next?</h3>
    <ul style="line-height: 1.8;">
      <li>Review the event details above</li>
      <li>Share this with your team or colleagues who might be interested</li>
      <li>Reply to this email if you have any questions</li>
      <li>When ready, contact us to proceed with registration</li>
    </ul>

    <p style="margin-top: 20px;">
      We'll follow up with you in the next few days to see if you have any questions.
    </p>

    <p style="font-weight: 600; color: #2563eb;">
      Ready to register? Simply reply to this email or call us to secure your spot!
    </p>
  `;

  return {
    subject: `Event Details: ${data.eventTitle}`,
    html: emailWrapper(content, data.leadName),
    text: `Dear ${data.leadName},\n\nThank you for your interest in ${data.eventTitle}.\n\nEvent Details:\nDate: ${formatDate(data.eventStartDate)}\nLocation: ${data.eventLocation}\n\nReference Number: ${data.referenceNumber}\n\nWe'll follow up with you in the next few days.\n\nBest regards,\nInformation Assets Training Team`,
  };
};

/**
 * TEMPLATE 2: Contact Me to Discuss
 */
export const contactDiscussTemplate = (data: EmailData): EmailTemplate => {
  const content = `
    <p>Thank you for reaching out to discuss our upcoming event!</p>

    <p>We've received your request and one of our team members will contact you within the next 24 hours to discuss:</p>

    <ul style="line-height: 1.8;">
      <li>Event details and agenda</li>
      <li>Your specific training needs</li>
      <li>Registration process and pricing</li>
      <li>Any questions you may have</li>
    </ul>

    ${eventDetailsCard(data)}

    <p style="margin-top: 20px;">
      In the meantime, if you have any immediate questions, feel free to reply to this email.
    </p>

    <p style="background-color: #dbeafe; padding: 15px; border-radius: 6px; margin-top: 20px;">
      <strong>💡 Quick Tip:</strong> Prepare any specific questions about the event content, prerequisites, or certification to make the most of our call!
    </p>
  `;

  return {
    subject: `We'll Contact You Soon - ${data.eventTitle}`,
    html: emailWrapper(content, data.leadName),
    text: `Dear ${data.leadName},\n\nThank you for requesting a discussion about ${data.eventTitle}.\n\nWe'll contact you within 24 hours to discuss the event details and answer your questions.\n\nReference Number: ${data.referenceNumber}\n\nBest regards,\nInformation Assets Training Team`,
  };
};

/**
 * TEMPLATE 3: Ready to Register Now
 */
export const registerNowTemplate = (data: EmailData): EmailTemplate => {
  const content = `
    <p>Excellent! We're thrilled that you're ready to register for our event!</p>

    ${eventDetailsCard(data)}

    <h3 style="color: #1e40af; margin-top: 30px;">🎯 Next Steps to Complete Your Registration:</h3>

    <ol style="line-height: 2;">
      <li><strong>Confirmation Call:</strong> Our team will contact you today to confirm your details</li>
      <li><strong>Registration Form:</strong> We'll send you the official registration form</li>
      <li><strong>Payment Details:</strong> You'll receive payment instructions and invoice</li>
      <li><strong>Confirmation:</strong> Once payment is confirmed, you'll receive joining instructions</li>
    </ol>

    <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 4px;">
      <strong style="color: #059669;">✅ Your spot is being reserved!</strong><br>
      We're processing your registration request and will have you confirmed shortly.
    </div>

    <p style="margin-top: 20px;">
      If you have any questions or need immediate assistance, please don't hesitate to reply to this email or call us.
    </p>

    <a href="mailto:reply@informationassets.com?subject=Registration for ${encodeURIComponent(data.eventTitle)} - ${data.referenceNumber}" class="cta-button">
      Reply to This Email
    </a>
  `;

  return {
    subject: `Registration in Progress - ${data.eventTitle}`,
    html: emailWrapper(content, data.leadName),
    text: `Dear ${data.leadName},\n\nExcellent! We're processing your registration for ${data.eventTitle}.\n\nOur team will contact you today to complete the registration process.\n\nReference Number: ${data.referenceNumber}\n\nBest regards,\nInformation Assets Training Team`,
  };
};

/**
 * TEMPLATE 4: Group Registration
 */
export const groupRegistrationTemplate = (data: EmailData): EmailTemplate => {
  const content = `
    <p>Thank you for your interest in registering multiple participants from <strong>${data.organizationName}</strong>!</p>

    <p>Group registrations come with special benefits:</p>

    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <strong style="color: #d97706;">🎁 Group Registration Benefits:</strong>
      <ul style="margin: 10px 0 0 0;">
        <li>Discounted group pricing (3+ participants)</li>
        <li>Flexible payment terms</li>
        <li>Dedicated coordinator for your team</li>
        <li>Customized certificates for all participants</li>
      </ul>
    </div>

    ${eventDetailsCard(data)}

    <h3 style="color: #1e40af; margin-top: 30px;">📋 What We'll Discuss:</h3>
    <ul style="line-height: 1.8;">
      <li>Number of participants you'd like to register</li>
      <li>Group pricing options and discounts</li>
      <li>Payment arrangements (single invoice vs. individual)</li>
      <li>Participant details collection process</li>
      <li>Any special requirements or questions</li>
    </ul>

    <p style="margin-top: 20px;">
      Our team will contact you within 24 hours to discuss your group registration requirements and provide a customized quote.
    </p>
  `;

  return {
    subject: `Group Registration Inquiry - ${data.eventTitle}`,
    html: emailWrapper(content, data.leadName),
    text: `Dear ${data.leadName},\n\nThank you for your group registration inquiry for ${data.eventTitle}.\n\nWe'll contact you within 24 hours to discuss group pricing and requirements.\n\nReference Number: ${data.referenceNumber}\n\nBest regards,\nInformation Assets Training Team`,
  };
};

/**
 * TEMPLATE 5: Corporate Training Request
 */
export const corporateTrainingTemplate = (data: EmailData): EmailTemplate => {
  const content = `
    <p>Thank you for your interest in customized corporate training for <strong>${data.organizationName}</strong>!</p>

    <p>We're excited to learn more about your organization's specific training needs.</p>

    <div style="background-color: #ede9fe; border-left: 4px solid #8b5cf6; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <strong style="color: #7c3aed;">🏢 Corporate Training Advantages:</strong>
      <ul style="margin: 10px 0 0 0;">
        <li>Content tailored to your organization's needs</li>
        <li>Flexible scheduling (at your location or ours)</li>
        <li>Training aligned with your workflows and systems</li>
        <li>Dedicated trainer for your team</li>
        <li>Post-training support and consultation</li>
      </ul>
    </div>

    <p>Based on your interest in <strong>${data.eventTitle}</strong>, we can customize this training specifically for your organization.</p>

    ${eventDetailsCard(data)}

    <h3 style="color: #1e40af; margin-top: 30px;">🎯 Next Steps - Needs Assessment:</h3>
    <p>Our training consultant will contact you within 24 hours to schedule a needs assessment meeting where we'll discuss:</p>

    <ul style="line-height: 1.8;">
      <li>Your organization's specific training objectives</li>
      <li>Number of participants and their roles</li>
      <li>Preferred training location and dates</li>
      <li>Current skill levels and desired outcomes</li>
      <li>Budget and timeline considerations</li>
    </ul>

    <p style="margin-top: 20px;">
      After the needs assessment, we'll create a customized training proposal with a detailed curriculum and pricing.
    </p>
  `;

  return {
    subject: `Corporate Training Consultation - ${data.eventTitle}`,
    html: emailWrapper(content, data.leadName),
    text: `Dear ${data.leadName},\n\nThank you for your corporate training inquiry for ${data.organizationName}.\n\nWe'll contact you within 24 hours to schedule a needs assessment meeting.\n\nReference Number: ${data.referenceNumber}\n\nBest regards,\nInformation Assets Training Team`,
  };
};

/**
 * TEMPLATE 6: Just Browsing / Newsletter Signup
 */
export const justBrowsingTemplate = (data: EmailData): EmailTemplate => {
  const content = `
    <p>Thank you for your interest in staying updated with our training events!</p>

    <p>We've added you to our mailing list and you'll receive:</p>

    <ul style="line-height: 1.8;">
      <li>📅 Upcoming event announcements</li>
      <li>📚 New course releases and updates</li>
      <li>💡 Industry insights and best practices</li>
      <li>🎁 Exclusive early-bird discounts</li>
    </ul>

    <p>Since you showed interest in this event, here are the details for your reference:</p>

    ${eventDetailsCard(data)}

    <div style="background-color: #dbeafe; padding: 20px; margin: 25px 0; border-radius: 6px;">
      <strong>💡 Not ready to commit yet?</strong><br>
      That's perfectly fine! Keep an eye on your inbox for future events. When you're ready, simply reply to any of our emails or visit our website to register.
    </div>

    <p style="margin-top: 20px;">
      If you change your mind and would like to discuss this event further, feel free to reply to this email anytime.
    </p>

    <p style="font-size: 12px; color: #64748b; margin-top: 30px;">
      <em>You can unsubscribe from our mailing list at any time by replying to this email with "UNSUBSCRIBE" in the subject line.</em>
    </p>
  `;

  return {
    subject: `Welcome! Event Updates from Information Assets`,
    html: emailWrapper(content, data.leadName),
    text: `Dear ${data.leadName},\n\nThank you for signing up for event updates!\n\nYou'll receive notifications about upcoming events including ${data.eventTitle}.\n\nReference Number: ${data.referenceNumber}\n\nBest regards,\nInformation Assets Training Team`,
  };
};

/**
 * Get email template based on inquiry type
 */
export const getEmailTemplate = (
  inquiryType: string,
  data: EmailData
): EmailTemplate => {
  switch (inquiryType) {
    case 'send_writeup':
      return sendWriteupTemplate(data);
    case 'contact_discuss':
      return contactDiscussTemplate(data);
    case 'register_now':
      return registerNowTemplate(data);
    case 'group_registration':
      return groupRegistrationTemplate(data);
    case 'corporate_training':
      return corporateTrainingTemplate(data);
    case 'just_browsing':
      return justBrowsingTemplate(data);
    default:
      // Fallback to send_writeup template
      return sendWriteupTemplate(data);
  }
};
