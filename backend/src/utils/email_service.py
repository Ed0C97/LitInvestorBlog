# LitInvestorBlog-backend/src/utils/email_service.py

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

class EmailService:
    """Servizio per invio email SMTP"""
    
    def __init__(self):
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.register.it')
        self.smtp_port = int(os.getenv('SMTP_PORT', '465'))  # 465 SSL o 587 TLS
        self.smtp_user = os.getenv('SMTP_USER')  # noreply@tuodominio.com
        self.smtp_password = os.getenv('SMTP_PASSWORD')
        self.from_email = os.getenv('FROM_EMAIL', self.smtp_user)
        self.from_name = os.getenv('FROM_NAME', 'Lit Investor Blog')
        
    def send_email(self, to_email, subject, html_body, text_body=None):
        """
        Invia email HTML
        
        Args:
            to_email: Destinatario
            subject: Oggetto email
            html_body: Corpo HTML
            text_body: Corpo testo plain (fallback)
        """
        try:
            # Crea messaggio
            msg = MIMEMultipart('alternative')
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Aggiungi corpo testo e HTML
            if text_body:
                part1 = MIMEText(text_body, 'plain', 'utf-8')
                msg.attach(part1)
            
            part2 = MIMEText(html_body, 'html', 'utf-8')
            msg.attach(part2)
            
            # Connessione SMTP SSL (porta 465)
            if self.smtp_port == 465:
                with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port) as server:
                    server.login(self.smtp_user, self.smtp_password)
                    server.send_message(msg)
            # Connessione SMTP TLS (porta 587)
            else:
                with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                    server.starttls()
                    server.login(self.smtp_user, self.smtp_password)
                    server.send_message(msg)
            
            return True, "Email inviata con successo"
            
        except Exception as e:
            return False, f"Errore invio email: {str(e)}"
    
    def send_newsletter_confirmation(self, to_email):
        """Invia email conferma iscrizione newsletter"""
        subject = "Conferma iscrizione alla Newsletter - Lit Investor Blog"
        
        # Template HTML base (poi personalizzerai)
        html_body = self._get_newsletter_template(to_email)
        
        text_body = f"""
        Grazie per esserti iscritto alla newsletter di Lit Investor Blog!
        
        Riceverai aggiornamenti periodici sui nostri ultimi articoli e analisi finanziarie.
        
        Se non hai richiesto questa iscrizione, puoi ignorare questa email.
        
        ---
        Lit Investor Blog
        """
        
        return self.send_email(to_email, subject, html_body, text_body)
    
    def send_contact_confirmation(self, to_email, user_name, message_preview):
        """Invia email conferma invio messaggio contatti"""
        subject = "Messaggio ricevuto - Lit Investor Blog"
        
        # Template HTML base (poi personalizzerai)
        html_body = self._get_contact_confirmation_template(user_name, message_preview)
        
        text_body = f"""
        Ciao {user_name},
        
        Abbiamo ricevuto il tuo messaggio e ti risponderemo al più presto.
        
        Il tuo messaggio:
        "{message_preview[:100]}..."
        
        Grazie per averci contattato!
        
        ---
        Lit Investor Blog
        """
        
        return self.send_email(to_email, subject, html_body, text_body)
    
    def send_contact_notification(self, user_email, user_name, user_message):
        """Invia notifica al team per nuovo messaggio contatti"""
        admin_email = os.getenv('CONTACT_ADMIN_EMAIL', 'admin@tuodominio.com')
        subject = f"Nuovo messaggio da {user_name}"
        
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif;">
            <h2>Nuovo messaggio dal form contatti</h2>
            <p><strong>Da:</strong> {user_name} ({user_email})</p>
            <p><strong>Messaggio:</strong></p>
            <p style="padding: 15px; background: #f5f5f5; border-left: 3px solid #0066cc;">
                {user_message}
            </p>
            <p><small>Rispondi direttamente a: {user_email}</small></p>
        </body>
        </html>
        """
        
        return self.send_email(admin_email, subject, html_body)
    
    def _get_newsletter_template(self, email):
        """Template HTML newsletter - PERSONALIZZABILE"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td align="center" style="padding: 40px 0;">
                        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 30px; background-color: #0d1117; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Lit Investor Blog</h1>
                                </td>
                            </tr>
                            
                            <!-- Body -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="color: #333333; font-size: 24px; margin-top: 0;">Benvenuto nella nostra Newsletter!</h2>
                                    <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                        Grazie per esserti iscritto alla newsletter di <strong>Lit Investor Blog</strong>.
                                    </p>
                                    <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                        Riceverai aggiornamenti periodici con:
                                    </p>
                                    <ul style="color: #666666; font-size: 16px; line-height: 1.8;">
                                        <li>Analisi finanziarie approfondite</li>
                                        <li>Guide agli investimenti</li>
                                        <li>News dai mercati</li>
                                        <li>Consigli per investitori</li>
                                    </ul>
                                    <p style="color: #999999; font-size: 14px; margin-top: 30px;">
                                        Se non hai richiesto questa iscrizione, puoi ignorare questa email.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 20px 30px; background-color: #f8f8f8; text-align: center;">
                                    <p style="color: #999999; font-size: 12px; margin: 0;">
                                        © 2025 Lit Investor Blog. Tutti i diritti riservati.
                                    </p>
                                    <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                                        Email inviata a: {email}
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
    
    def _get_contact_confirmation_template(self, name, message_preview):
        """Template HTML conferma contatto - PERSONALIZZABILE"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td align="center" style="padding: 40px 0;">
                        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 30px; background-color: #0d1117; text-align: center;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Lit Investor Blog</h1>
                                </td>
                            </tr>
                            
                            <!-- Body -->
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="color: #333333; font-size: 24px; margin-top: 0;">Ciao {name}!</h2>
                                    <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                        Abbiamo ricevuto il tuo messaggio e ti risponderemo al più presto.
                                    </p>
                                    <div style="background-color: #f8f8f8; padding: 20px; border-left: 4px solid #0066cc; margin: 20px 0;">
                                        <p style="color: #666666; font-size: 14px; margin: 0; font-style: italic;">
                                            "{message_preview[:150]}..."
                                        </p>
                                    </div>
                                    <p style="color: #666666; font-size: 16px; line-height: 1.6;">
                                        Grazie per averci contattato!
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 20px 30px; background-color: #f8f8f8; text-align: center;">
                                    <p style="color: #999999; font-size: 12px; margin: 0;">
                                        © 2025 Lit Investor Blog. Tutti i diritti riservati.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """

    def send_warning_email(self, to_email, username, first_name, warning_message):
        """Invia email di warning a un utente"""
        subject = "⚠️ Important: Community Guidelines Warning"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {{
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }}
            .container {{
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            .header {{
              background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%);
              padding: 30px;
              text-align: center;
            }}
            .header h1 {{
              margin: 0;
              color: white;
              font-size: 24px;
              font-weight: 600;
            }}
            .content {{
              padding: 40px 30px;
            }}
            .warning-icon {{
              text-align: center;
              font-size: 48px;
              margin-bottom: 20px;
            }}
            .message-box {{
              background: #FFF3CD;
              border-left: 4px solid #FFA500;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }}
            .message-box h3 {{
              margin-top: 0;
              color: #856404;
            }}
            .message-box p {{
              color: #856404;
              margin: 0;
              white-space: pre-wrap;
            }}
            .action-required {{
              background: #f8f9fa;
              padding: 20px;
              border-radius: 4px;
              margin: 20px 0;
            }}
            .footer {{
              background: #f8f9fa;
              padding: 20px 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Community Guidelines Warning</h1>
            </div>
            <div class="content">
              <div class="warning-icon">⚠️</div>
              
              <p>Hello <strong>{first_name or username}</strong>,</p>
              
              <p>We're reaching out to inform you that your recent activity on <strong>Lit Investor Blog</strong> has raised concerns regarding our community guidelines.</p>
              
              <div class="message-box">
                <h3>Moderator Message:</h3>
                <p>{warning_message}</p>
              </div>
              
              <div class="action-required">
                <h3>📋 What You Should Do:</h3>
                <ul>
                  <li>Review our Community Guidelines</li>
                  <li>Ensure your future comments comply with our standards</li>
                  <li>Be respectful and constructive in your interactions</li>
                </ul>
              </div>
              
              <p><strong>Please Note:</strong> This is a formal warning. Repeated violations may result in temporary suspension or permanent ban from the platform.</p>
              
              <p>If you believe this warning was issued in error or have questions, please reply to this email.</p>
              
              <p>Thank you for your understanding and cooperation in maintaining a positive community environment.</p>
              
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The Lit Investor Blog Moderation Team</strong>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated message from Lit Investor Blog</p>
              <p>© 2025 Lit Investor Blog. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
        """
        
        text_body = f"""
        Hello {first_name or username},
        
        We're reaching out to inform you that your recent activity on Lit Investor Blog has raised concerns regarding our community guidelines.
        
        Moderator Message:
        {warning_message}
        
        What You Should Do:
        - Review our Community Guidelines
        - Ensure your future comments comply with our standards
        - Be respectful and constructive in your interactions
        
        Please Note: This is a formal warning. Repeated violations may result in temporary suspension or permanent ban from the platform.
        
        If you believe this warning was issued in error or have questions, please reply to this email.
        
        Thank you for your understanding and cooperation in maintaining a positive community environment.
        
        Best regards,
        The Lit Investor Blog Moderation Team
        """
        
        return self.send_email(to_email, subject, html_body, text_body)
    
    def send_ban_notification_email(self, to_email, username, first_name, ban_reason):
        """Invia email di notifica ban a un utente"""
        subject = "🚫 Account Suspended - Lit Investor Blog"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {{
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }}
            .container {{
              max-width: 600px;
              margin: 40px auto;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }}
            .header {{
              background: linear-gradient(135deg, #DC3545 0%, #C82333 100%);
              padding: 30px;
              text-align: center;
            }}
            .header h1 {{
              margin: 0;
              color: white;
              font-size: 24px;
              font-weight: 600;
            }}
            .content {{
              padding: 40px 30px;
            }}
            .ban-icon {{
              text-align: center;
              font-size: 48px;
              margin-bottom: 20px;
            }}
            .reason-box {{
              background: #F8D7DA;
              border-left: 4px solid #DC3545;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }}
            .reason-box h3 {{
              margin-top: 0;
              color: #721C24;
            }}
            .reason-box p {{
              color: #721C24;
              margin: 0;
              white-space: pre-wrap;
            }}
            .info-box {{
              background: #f8f9fa;
              padding: 20px;
              border-radius: 4px;
              margin: 20px 0;
            }}
            .footer {{
              background: #f8f9fa;
              padding: 20px 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚫 Account Suspended</h1>
            </div>
            <div class="content">
              <div class="ban-icon">🚫</div>
              
              <p>Hello <strong>{first_name or username}</strong>,</p>
              
              <p>We regret to inform you that your account on <strong>Lit Investor Blog</strong> has been permanently suspended due to violations of our community guidelines.</p>
              
              <div class="reason-box">
                <h3>Reason for Suspension:</h3>
                <p>{ban_reason}</p>
              </div>
              
              <div class="info-box">
                <h3>📌 What This Means:</h3>
                <ul>
                  <li>Your account has been deactivated</li>
                  <li>You will no longer be able to log in or post comments</li>
                  <li>This decision is final and cannot be reversed</li>
                  <li>Creating new accounts to circumvent this ban is prohibited</li>
                </ul>
              </div>
              
              <p><strong>Appeal Process:</strong></p>
              <p>If you believe this ban was issued in error, you may submit an appeal by replying to this email within 14 days. Please provide detailed information about why you believe the ban should be reconsidered.</p>
              
              <p>We take community standards seriously to ensure a safe and respectful environment for all our users.</p>
              
              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>The Lit Investor Blog Moderation Team</strong>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated message from Lit Investor Blog</p>
              <p>© 2025 Lit Investor Blog. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
        """
        
        text_body = f"""
        Hello {first_name or username},
        
        We regret to inform you that your account on Lit Investor Blog has been permanently suspended due to violations of our community guidelines.
        
        Reason for Suspension:
        {ban_reason}
        
        What This Means:
        - Your account has been deactivated
        - You will no longer be able to log in or post comments
        - This decision is final and cannot be reversed
        - Creating new accounts to circumvent this ban is prohibited
        
        Appeal Process:
        If you believe this ban was issued in error, you may submit an appeal by replying to this email within 14 days. Please provide detailed information about why you believe the ban should be reconsidered.
        
        We take community standards seriously to ensure a safe and respectful environment for all our users.
        
        Best regards,
        The Lit Investor Blog Moderation Team
        """
        
        return self.send_email(to_email, subject, html_body, text_body)

# Istanza globale
email_service = EmailService()
