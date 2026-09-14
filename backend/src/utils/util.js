
// ==========================================
// GENERATE OTP
// ==========================================

function generateOtp() {

    return Math.floor(
        100000 + Math.random() * 900000
    ).toString();

}


// ==========================================
// OTP EMAIL HTML
// ==========================================

function getOtpHtml(otp) {

    return `
    <!DOCTYPE html>

    <html>

    <head>
        <meta charset="UTF-8">
        <title>OTP Verification</title>
    </head>

    <body style="
        font-family: Arial, sans-serif;
        background:#f4f4f4;
        padding:20px;
    ">

        <div style="
            max-width:600px;
            margin:auto;
            background:#ffffff;
            padding:30px;
            border-radius:10px;
            text-align:center;
        ">

            <h2 style="color:#333;">
                Email Verification
            </h2>

            <p>
                Your One-Time Password (OTP) is:
            </p>

            <h1 style="
                letter-spacing:5px;
                color:#2563eb;
            ">
                ${otp}
            </h1>

            <p>
                This OTP is valid for
                <strong>10 minutes</strong>.
            </p>

            <p>
                If you didn't request this OTP,
                you can safely ignore this email.
            </p>

            <hr>

            <small>
                © 2026 Food-ai App. All Rights Reserved.
            </small>

        </div>

    </body>

    </html>
    `;

}


// ==========================================
// CONTACT DEVELOPER EMAIL HTML
// ==========================================

function getContactDeveloperHtml({
    fullname,
    address,
    contactno,
    email,
    reason,
    userId
}) {

    return `
    <!DOCTYPE html>

    <html>

    <head>
        <meta charset="UTF-8">
        <title>Contact Developer</title>
    </head>

    <body style="
        font-family: Arial, sans-serif;
        background:#f4f4f4;
        padding:20px;
    ">

        <div style="
            max-width:600px;
            margin:auto;
            background:#ffffff;
            padding:30px;
            border-radius:10px;
        ">

            <h2 style="
                color:#2563eb;
                text-align:center;
            ">
                New Contact Developer Request
            </h2>

            <hr>

            <p>
                <strong>Full Name:</strong>
                ${fullname}
            </p>

            <p>
                <strong>Address:</strong>
                ${address}
            </p>

            <p>
                <strong>Contact Number:</strong>
                ${contactno}
            </p>

            <p>
                <strong>Email:</strong>
                ${email}
            </p>

            <p>
                <strong>Reason:</strong>
                ${reason}
            </p>

            <p>
                <strong>User ID:</strong>
                ${userId}
            </p>

            <hr>

            <p style="
                color:#666;
                font-size:14px;
            ">
                This message was submitted through
                the Food-ai App contact developer form.
            </p>

            <small>
                © 2026 Food-ai App. All Rights Reserved.
            </small>

        </div>

    </body>

    </html>
    `;

}


module.exports = {

    generateOtp,

    getOtpHtml,

    getContactDeveloperHtml

};
