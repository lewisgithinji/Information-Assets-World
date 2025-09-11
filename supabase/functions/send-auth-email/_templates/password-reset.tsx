import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface PasswordResetEmailProps {
  resetUrl: string
  siteName?: string
}

export const PasswordResetEmail = ({
  resetUrl,
  siteName = "Information Assets World",
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your {siteName} password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Password Reset Request</Heading>
        </Section>
        
        <Section style={content}>
          <Text style={text}>
            We received a request to reset the password for your {siteName} account.
          </Text>
          
          <Text style={text}>
            Click the button below to create a new password. This link will expire in 1 hour for security reasons.
          </Text>
          
          <Section style={buttonContainer}>
            <Link href={resetUrl} style={button}>
              Reset Your Password
            </Link>
          </Section>
          
          <Text style={smallText}>
            Or copy and paste this link into your browser:
          </Text>
          <Text style={linkText}>{resetUrl}</Text>
          
          <Section style={warningBox}>
            <Text style={warningText}>
              <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
            </Text>
          </Section>
          
          <Text style={text}>
            For your security, this reset link will only work once and expires in 1 hour.
          </Text>
        </Section>
        
        <Section style={footer}>
          <Text style={footerText}>
            Best regards,<br />
            The Information Assets World Team
          </Text>
          <Text style={footerText}>
            If you're having trouble with the link above, copy and paste it into your web browser.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#f8fafc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
}

const header = {
  textAlign: 'center' as const,
  padding: '32px 0',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
}

const content = {
  padding: '32px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
}

const smallText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '16px 0 8px',
}

const linkText = {
  color: '#2563eb',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px',
  wordBreak: 'break-all' as const,
}

const warningBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
}

const warningText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const footer = {
  borderTop: '1px solid #e2e8f0',
  paddingTop: '24px',
  marginTop: '32px',
}

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
}