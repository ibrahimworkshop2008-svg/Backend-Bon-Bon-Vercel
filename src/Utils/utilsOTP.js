const GenerateOTP = () => {
    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("OTP generated:", otp);
    return otp;
}


const sendOTPEmail = (otp) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <title>OTP Verification</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
            <tr>
                <td align="center">
                    <table width="500" cellpadding="0" cellspacing="0" 
                        style="background:#ffffff;border-radius:10px;padding:40px;box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                        
                        <tr>
                            <td align="center">
                                <h2 style="color:#333;margin-bottom:10px;">
                                    Email Verification
                                </h2>

                                <p style="color:#666;font-size:16px;line-height:24px;">
                                    Use the OTP below to verify your account.
                                </p>

                                <div style="
                                    margin:30px 0;
                                    font-size:32px;
                                    font-weight:bold;
                                    letter-spacing:8px;
                                    color:#4F46E5;
                                    background:#EEF2FF;
                                    display:inline-block;
                                    padding:15px 30px;
                                    border-radius:8px;
                                ">
                                    ${otp}
                                </div>

                                <p style="color:#888;font-size:14px;line-height:22px;">
                                    This OTP is valid for 5 minutes.<br/>
                                    Please do not share it with anyone.
                                </p>

                                <hr style="border:none;border-top:1px solid #eee;margin:30px 0;" />

                                <p style="color:#aaa;font-size:12px;">
                                    If you did not request this email, you can safely ignore it.
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}


module.exports = {
    GenerateOTP,
    sendOTPEmail
}