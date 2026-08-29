<?php
// mailer.php — sends real SMTP email using PHPMailer.
//
// Requires PHPMailer to be installed via Composer:
//   cd C:\xampp\htdocs\technosoft-api
//   composer require phpmailer/phpmailer
// This creates a vendor/ folder with everything wired up automatically.

require_once __DIR__ . '/mail_config.php';
require_once __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/**
 * Sends a ticket-confirmation email to a customer.
 * Returns true on success, false on failure — never throws, so a failed
 * email never breaks ticket creation itself.
 */
function sendTicketConfirmationEmail(string $toEmail, string $toName, string $ticketNumber, string $subject): bool {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = SMTP_ENCRYPTION === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;

        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->addAddress($toEmail, $toName);

        $mail->isHTML(true);
        $mail->Subject = "Your Technosoft support ticket: {$ticketNumber}";
        $mail->Body = "
            <div style='font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;'>
              <h2 style='color:#0A0A0A;'>We've got your ticket</h2>
              <p>Hi {$toName},</p>
              <p>Thanks for reaching out. Your support ticket has been created:</p>
              <table style='width:100%; border-collapse: collapse; margin: 16px 0;'>
                <tr><td style='padding:8px 0; color:#6B7280;'>Ticket number</td><td style='padding:8px 0; font-weight:bold;'>{$ticketNumber}</td></tr>
                <tr><td style='padding:8px 0; color:#6B7280;'>Subject</td><td style='padding:8px 0;'>{$subject}</td></tr>
              </table>
              <p>Keep this ticket number for reference — our team will get back to you shortly. You can also log in to your account any time to check its status.</p>
              <p style='color:#6B7280; font-size:13px; margin-top:24px;'>— Technosoft Support</p>
            </div>
        ";
        $mail->AltBody = "Hi {$toName},\n\nYour support ticket has been created.\nTicket number: {$ticketNumber}\nSubject: {$subject}\n\nKeep this ticket number for reference — our team will get back to you shortly.\n\n— Technosoft Support";

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Ticket confirmation email failed: " . $mail->ErrorInfo);
        return false;
    }
}

/**
 * Sends an order-confirmation email to a customer.
 * Returns true on success, false on failure — never throws, so a failed
 * email never breaks order creation itself.
 */
function sendOrderConfirmationEmail(string $toEmail, string $toName, string $orderNumber, float $total): bool {
    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = SMTP_ENCRYPTION === 'ssl' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = SMTP_PORT;

        $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
        $mail->addAddress($toEmail, $toName);

        $formattedTotal = number_format($total, 2);

        $mail->isHTML(true);
        $mail->Subject = "Your Technosoft order: {$orderNumber}";
        $mail->Body = "
            <div style='font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;'>
              <h2 style='color:#0A0A0A;'>Thanks for your order</h2>
              <p>Hi {$toName},</p>
              <p>We've received your order and it's being processed:</p>
              <table style='width:100%; border-collapse: collapse; margin: 16px 0;'>
                <tr><td style='padding:8px 0; color:#6B7280;'>Order number</td><td style='padding:8px 0; font-weight:bold;'>{$orderNumber}</td></tr>
                <tr><td style='padding:8px 0; color:#6B7280;'>Total</td><td style='padding:8px 0;'>ZMW {$formattedTotal}</td></tr>
              </table>
              <p>Keep this order number for reference — you can log in to your account any time to check its status.</p>
              <p style='color:#6B7280; font-size:13px; margin-top:24px;'>— Technosoft</p>
            </div>
        ";
        $mail->AltBody = "Hi {$toName},\n\nWe've received your order.\nOrder number: {$orderNumber}\nTotal: ZMW {$formattedTotal}\n\nKeep this order number for reference.\n\n— Technosoft";

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Order confirmation email failed: " . $mail->ErrorInfo);
        return false;
    }
}
