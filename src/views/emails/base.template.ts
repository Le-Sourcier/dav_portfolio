interface BaseTemplateOptions {
  title: string;
  previewText?: string;
  content: string;
  lang?: "fr" | "en";
  unsubscribeEmail?: string;
  unsubscribeUrl?: string;
  baseUrl?: string;
  phone?: string;
}

export const baseEmailTemplate = (options: BaseTemplateOptions): string => {
  const {
    title,
    previewText,
    content,
    lang = "fr",
    baseUrl = "https://lesourcier.space",
    phone,
  } = options;
  const isFr = lang === "fr";
  const logoUrl = `${baseUrl}/brand/logo-horizontal-clean.png`;

  return `<!DOCTYPE html>
<html lang="${lang}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    table { border-collapse: collapse; }
    td { font-family: 'Segoe UI', Arial, sans-serif; }
  </style>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      margin: 0;
      padding: 0;
      background-color: #f4efe5;
      font-family: 'Inter', 'Segoe UI', Roboto, Arial, sans-serif;
      color: #111111;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 560px;
      margin: 0 auto;
      padding: 32px 16px;
    }

    .card {
      background: #fffaf5;
      border-radius: 14px;
      border: 1px solid rgba(17, 17, 17, 0.1);
      box-shadow: 0 12px 40px rgba(75, 61, 35, 0.07);
      overflow: hidden;
    }

    .card-accent {
      height: 4px;
      background: linear-gradient(90deg, #b8842f, #0f766e, #b8842f);
      background-size: 200% 100%;
    }

    .header {
      padding: 36px 32px 20px;
      text-align: center;
    }

    .header-logo {
      display: block;
      width: 160px;
      height: auto;
      margin: 0 auto;
      max-width: 100%;
    }

    .header-logo img {
      display: block;
      width: 160px;
      height: auto;
      border: 0;
      outline: none;
    }

    .body {
      padding: 8px 32px 24px;
    }

    .greeting {
      font-size: 17px;
      font-weight: 500;
      margin-bottom: 18px;
      color: #111111;
    }

    .greeting strong {
      color: #0f766e;
      font-weight: 600;
    }

    .content-text {
      font-size: 15px;
      line-height: 1.7;
      color: #3a3a3a;
    }

    .content-text p {
      margin-bottom: 14px;
    }

    .info-box {
      background: rgba(15, 118, 110, 0.06);
      border: 1px solid rgba(15, 118, 110, 0.15);
      border-radius: 12px;
      padding: 20px 22px;
      margin: 18px 0;
    }

    .info-box strong {
      color: #0f766e;
      font-weight: 600;
    }

    .info-box ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .info-box li {
      margin-bottom: 8px;
      font-size: 14px;
      color: #3a3a3a;
    }

    .info-box li:last-child {
      margin-bottom: 0;
    }

    .label {
      color: #6f6a60;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      display: block;
      margin-bottom: 2px;
    }

    .divider {
      height: 1px;
      background: rgba(17, 17, 17, 0.1);
      margin: 22px 0;
    }

    .button-wrap {
      text-align: center;
      margin: 24px 0;
    }

    .button {
      display: inline-block;
      padding: 13px 32px;
      background-color: #111111;
      color: #f7f3ea !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      letter-spacing: 0.02em;
    }

    .button-teal {
      background: linear-gradient(135deg, #0b4f49, #0f766e 60%, #115e59);
      color: #fffaf1 !important;
    }

    .quote-block {
      background: rgba(17, 17, 17, 0.04);
      border-left: 3px solid rgba(184, 132, 47, 0.4);
      border-radius: 0 10px 10px 0;
      padding: 14px 18px;
      margin: 16px 0;
      font-size: 14px;
      color: #3a3a3a;
    }

    .footer {
      padding: 20px 32px 28px;
      border-top: 1px solid rgba(17, 17, 17, 0.08);
      text-align: center;
    }

    .footer p {
      font-size: 12px;
      color: #8a857b;
      margin-bottom: 6px;
    }

    .footer a {
      color: #0f766e;
      text-decoration: none;
      font-weight: 500;
    }

    .footer-links {
      margin: 10px 0 6px;
    }

    .footer-links a {
      display: inline-block;
      margin: 0 8px;
      font-size: 12px;
      color: #6f6a60;
      text-decoration: none;
    }

    .footer-links a:hover {
      color: #0f766e;
    }

    .otp-code {
      text-align: center;
      margin: 24px 0;
    }

    .otp-code span {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: 6px;
      color: #0f766e;
      background: rgba(15, 118, 110, 0.08);
      padding: 14px 28px;
      border-radius: 10px;
      display: inline-block;
    }

    .pill {
      display: inline-block;
      padding: 3px 10px;
      background: rgba(15, 118, 110, 0.1);
      color: #0f766e;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .pill-gold {
      background: rgba(184, 132, 47, 0.12);
      color: #a0752a;
    }

    @media only screen and (max-width: 480px) {
      .container { padding: 16px 8px; }
      .header { padding: 28px 20px 16px; }
      .body { padding: 4px 20px 18px; }
      .footer { padding: 16px 20px 22px; }
    }

    @media (prefers-color-scheme: dark) {
      body { background-color: #0e0e0c; }
      .card { background: #141512; border-color: rgba(255, 247, 233, 0.1); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
      .greeting { color: #f7f1e7; }
      .greeting strong { color: #2dd4bf; }
      .content-text { color: #b8b0a4; }
      .info-box { background: rgba(45, 212, 191, 0.06); border-color: rgba(45, 212, 191, 0.15); }
      .info-box strong { color: #2dd4bf; }
      .info-box li { color: #b8b0a4; }
      .label { color: #8a857b; }
      .divider { background: rgba(255, 247, 233, 0.1); }
      .quote-block { background: rgba(215, 180, 100, 0.06); border-left-color: rgba(215, 180, 100, 0.35); color: #b8b0a4; }
      .button { background-color: #2dd4bf; color: #090a09 !important; }
      .button-teal { background: linear-gradient(135deg, #d7b464, #f2c96b); color: #090a09 !important; }
      .footer p { color: #6f6a60; }
      .footer a { color: #2dd4bf; }
      .footer-links a { color: #8a857b; }
      .footer-links a:hover { color: #2dd4bf; }
      .otp-code span { color: #2dd4bf; background: rgba(45, 212, 191, 0.1); }
      .pill { background: rgba(45, 212, 191, 0.12); color: #2dd4bf; }
      .pill-gold { background: rgba(215, 180, 100, 0.15); color: #f2c96b; }
      .card-accent { background: linear-gradient(90deg, #d7b464, #2dd4bf, #d7b464); }
    }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ""}
  <div class="container">
    <div class="card">
      <div class="card-accent"></div>
      <div class="header">
        <img src="${logoUrl}" alt="Yao David Logan" class="header-logo" width="160" style="display:block;width:160px;height:auto;border:0;outline:none;margin:0 auto;" />
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <div class="footer-links">
          <a href="https://github.com/Le-Sourcier"><img src="${baseUrl}/icons/github.svg" width="25" height="25" alt="GitHub" style="display:inline-block;vertical-align:middle;border:0;outline:none;margin-right:3px;" /> GitHub</a>
          <span style="color:#b8a080;font-size:11px;">·</span>
          <a href="https://linkedin.com/in/yao-logan"><img src="${baseUrl}/icons/linkedin.svg" width="25" height="25" alt="LinkedIn" style="display:inline-block;vertical-align:middle;border:0;outline:none;margin-right:3px;" /> LinkedIn</a>
          <span style="color:#b8a080;font-size:11px;">·</span>
          <a href="https://lesourcier.space"><img src="${baseUrl}/brand/apple-touch-icon.png" width="25" height="25" alt="Portfolio" style="display:inline-block;vertical-align:middle;border:0;outline:none;margin-right:3px;" /> Portfolio</a>
          ${
            phone
              ? `<span style="color:#b8a080;font-size:11px;">·</span>
          <a href="https://wa.me/${phone.replace(/[^0-9]/g, "")}"><img src="${baseUrl}/icons/whatsapp.svg" width="25" height="25" alt="WhatsApp" style="display:inline-block;vertical-align:middle;border:0;outline:none;margin-right:3px;" /> WhatsApp</a>`
              : ""
          }
        </div>
        <p>&copy; ${new Date().getFullYear()} Yao David Logan. ${isFr ? "Tous droits réservés." : "All rights reserved."}</p>
        ${options.unsubscribeEmail ? `<p style="margin-top:8px;font-size:11px;color:#8a857b;">${isFr ? "Vous recevez cet email car vous êtes inscrit à la newsletter." : "You're receiving this because you're subscribed to the newsletter."}<br><a href="${options.unsubscribeUrl || "#"}" style="color:#0f766e;text-decoration:underline;">${isFr ? "Se désabonner" : "Unsubscribe"}</a></p>` : ""}
      </div>
    </div>
  </div>
</body>
</html>`;
};

export default baseEmailTemplate;
