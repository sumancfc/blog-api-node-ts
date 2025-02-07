const getEmailSkeleton = (
    title: string,
    body: string
) => `<body style="width:100%; margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f5f6fa;">
<center style="width: 100%; background-color: #f5f6fa;">
      <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f5f6fa">
          <tr>
             <td style="padding: 40px 0;">
                  <table style="width:100%;max-width:620px;margin:0 auto;background-color:#ffffff;">
                      <tbody>
                          <tr>
                            <td style="padding: 30px 30px 15px 30px;">
                                <h2 style="font-size: 18px; color: #6576ff; font-weight: 600; margin: 0;">${title}</h2>
                            </td>
                          </tr>
                          ${body}
                          <tr>
                              <td style="padding: 20px 30px 40px">
                                  <p>If you did not make this request, please contact us or ignore this message.</p>
                                  <p style="margin: 0; font-size: 13px; line-height: 22px; color:#9ea8bb;">This is an automatically generated email please do not reply to this email. If you face any issues, please contact us at admin@gmail.com</p>
                              </td>
                          </tr>
                      </tbody>
                  </table>
              </td>
          </tr>
      </table>
  </center>
</body>`;

export const verifyEmailMessage = (name: string, username: string): string => {
    return getEmailSkeleton(
        "Confirm Your E-Mail Address",
        `
        <tr>
            <td style="padding: 0 30px 20px">
                <p style="margin-bottom: 10px;">Hi ${name}</p>
                <p style="margin-bottom: 10px;">Welcome! <br> You are receiving this email because you have registered on our site.</p>
                <p style="margin-bottom: 10px;">Click the link below to activate your account.</p>
                <p style="margin-bottom: 25px;">This link will expire in 15 minutes and can only be used once.</p>
                <a href="{process.env.CLIENT_URL}/email-verification/${username}" style="background-color:#6576ff;border-radius:4px;color:#ffffff;display:inline-block;font-size:13px;font-weight:600;line-height:44px;text-align:center;text-decoration:none;text-transform: uppercase; padding: 0 30px">Verify Your Email</a>
            </td>
        </tr>
        <tr>
            <td style="padding: 0 30px">
                <h4 style="font-size: 15px; color: #000000; font-weight: 600; margin: 0; text-transform: uppercase; margin-bottom: 10px">or</h4>
                <p style="margin-bottom: 10px;">If the button above does not work, paste this link into your web browser:</p>
                <a href="${process.env.CLIENT_URL}/email-verification/${username}">${process.env.CLIENT_URL}/email-verification/${username}</a>
            </td>
        </tr>`
    );
};

export const confirmEmailMessage = (name: string): string => {
    return getEmailSkeleton(
        "Welcome to User Management Platform",
        `
        <tr>
            <td style="padding: 0 30px 20px">
                <p style="margin-bottom: 10px;">Hi ${name}</p>
                <p style="margin-bottom: 10px;">We are pleased to have you as a member of our Family.</p>
                <p style="margin-bottom: 10px;">Your account is now verified.</p>
                <p style="margin-bottom: 15px;">To get started:</p>

                <p style="margin-bottom: 15px;">As a welcome gift, use code WELCOME10 for 10% off your first course!</p>
                <p style="margin-bottom: 15px;">Hope you'll enjoy the experience. We're here if you have any questions, drop us a line at <a style="color: #6576ff; text-decoration:none;" href="mailto:admin@gmail.com">admin@gmail.com</a> anytime.</p>
            </td>
        </tr>
        `
    );
};

export const passwordResetMessage = (name: string, code: string): string => {
    return getEmailSkeleton(
        "Reset Your Password",
        `
        <tr>
            <td style="padding: 0 30px 20px">
                <p style="margin-bottom: 10px;">Hi ${name}</p>
                <p style="margin-bottom: 25px;">Copy the code below to reset your password.</p>
                <p href="#" style="background-color:#6576ff;border-radius:4px;color:#ffffff;display:inline-block;font-size:13px;font-weight:600;line-height:44px;text-align:center;text-decoration:none;text-transform: uppercase; padding: 0 25px">${code}</p>
            </td>
        </tr>
        `
    );
};

export const passwordResetConfirmMessage = (name: string): string => {
    return getEmailSkeleton(
        "Password Reseted",
        `
        <tr>
            <td style="text-align:center;padding: 0 30px 20px">
                <p style="margin-bottom: 10px;">Hi ${name},</p>
                <p>You Successfully Reseted Your Password. Thanks For being with Us.</p>
            </td>
        </tr>
        `
    );
};

export const subscribedToNewsletter = (name: string): string => {
    return getEmailSkeleton(
        "User Management Platform",
        `
        <tr>
            <td style="padding: 0 30px 20px">
            <p style="margin-bottom: 10px;">Hi ${name},</p>
            <p style="margin-bottom: 10px;">Thank you for subscribing to our newsletter!</p>
            <p style="margin-bottom: 10px;">You're now part of our community, and you'll receive the latest updates, exclusive content, and special offers straight to your inbox.</p>
            <p style="margin-bottom: 15px;">Stay tuned for exciting news and insights!</p>

            <p style="margin-bottom: 15px;">If you ever have any questions or feedback, feel free to reach out at <a style="color: #6576ff; text-decoration:none;" href="mailto:admin@gmail.com">admin@gmail.com</a>.</p>

            <p style="margin-bottom: 15px;">Welcome aboard!</p>
        </td>
        </tr>
    `
    );
};
