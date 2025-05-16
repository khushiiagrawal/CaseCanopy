package services

import (
	"fmt"
	"os"
	"strconv"

	"gopkg.in/gomail.v2"
)

type EmailService struct {
	dialer *gomail.Dialer
}

func NewEmailService() *EmailService {
	// Get SMTP configuration from environment variables
	smtpHost := os.Getenv("SMTP_HOST")
	if smtpHost == "" {
		smtpHost = "smtp.gmail.com" // Default to Gmail SMTP
	}

	smtpPortStr := os.Getenv("SMTP_PORT")
	if smtpPortStr == "" {
		smtpPortStr = "587" // Default SMTP port
	}
	smtpPort, _ := strconv.Atoi(smtpPortStr)

	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")

	// Validate required configuration
	if smtpUser == "" || smtpPass == "" {
		fmt.Println("Warning: SMTP_USER or SMTP_PASS environment variables are not set")
	}

	dialer := gomail.NewDialer(smtpHost, smtpPort, smtpUser, smtpPass)

	// Configure TLS settings
	dialer.SSL = false     // Don't use SSL
	dialer.TLSConfig = nil // Let the dialer handle TLS configuration

	return &EmailService{
		dialer: dialer,
	}
}

func (es *EmailService) SendWelcomeEmail(email, name string) error {
	// Validate email configuration
	if es.dialer.Username == "" || es.dialer.Password == "" {
		return fmt.Errorf("SMTP configuration is incomplete. Please check SMTP_USER and SMTP_PASS environment variables")
	}

	m := gomail.NewMessage()
	m.SetHeader("From", es.dialer.Username) // Use the configured email as sender
	m.SetHeader("To", email)
	m.SetHeader("Subject", "Welcome to CaseCanopy!")

	body := fmt.Sprintf(`
		Dear %s,

		Thank you for registering with CaseCanopy! We're excited to have you on board.

		We are currently processing your registration and will review your documents shortly. 
		You will receive another email once your account has been verified.

		Best regards,
		The CaseCanopy Team
	`, name)

	m.SetBody("text/plain", body)

	// Test the connection before sending
	if err := es.dialer.DialAndSend(m); err != nil {
		return fmt.Errorf("failed to send welcome email: %v", err)
	}

	return nil
}

func (es *EmailService) SendApprovalEmail(to, name string) error {
	subject := "Your CaseCanopy Account Has Been Approved"
	body := fmt.Sprintf(`
		Dear %s,

		Your CaseCanopy account has been approved by our admin team. You can now log in to your account and start using our services.

		Best regards,
		The CaseCanopy Team
	`, name)

	return es.SendEmail(to, subject, body)
}

func (es *EmailService) SendEmail(to, subject, body string) error {
	m := gomail.NewMessage()
	m.SetHeader("From", es.dialer.Username)
	m.SetHeader("To", to)
	m.SetHeader("Subject", subject)
	m.SetBody("text/plain", body)

	return es.dialer.DialAndSend(m)
}
