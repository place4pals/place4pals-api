export const formatEmail = (body, email) => {
    return `<!DOCTYPE html>
<html lang="en"
      xmlns="http://www.w3.org/1999/xhtml"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:v="urn:schemas-microsoft-com:vml">

<head>
    <title></title>
    <meta charset="utf-8">
    <meta name="viewport"
          content="width=device-width">
    <meta http-equiv="X-UA-Compatible"
          content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="format-detection"
          content="telephone=no,address=no,email=no,date=no,url=no">
    <style>
        html,
        body {
            margin: 0 auto !important;
            padding: 0 !important;
            height: 100% !important;
            width: 100% !important;
        }

        * {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }

        div[style*="margin: 16px 0"] {
            margin: 0 !important;
        }

        table,
        td {
            mso-table-lspace: 0pt !important;
            mso-table-rspace: 0pt !important;
        }

        table {
            border: 0;
            border-spacing: 0;
            border-collapse: collapse
        }

        #MessageViewBody,
        #MessageWebViewDiv {
            width: 100% !important;
        }

        img {
            -ms-interpolation-mode: bicubic;
        }

        a {
            text-decoration: none;
        }
    </style>
</head>

<body width="100%"
      style="margin: 0; padding: 0 !important; background: #ffffff; mso-line-height-rule: exactly;">
    <center style="width: 100%; background: #ffffff;">
        <div class="email-container"
             style="max-width: 680px; margin: 0 auto;">
            <table border="0"
                   cellpadding="0"
                   cellspacing="0"
                   role="presentation"
                   style="max-width: 680px; width:100%">
                <tr>
                    <td style="padding: 10px  10px; text-align: left;"
                        class="sm-px">
                        <a style="display:flex;flex-direction:row;justify-content:flex-start;align-items:center;"
                           href="https://place4pals.com/"
                           target="_blank">
                            <img src="https://place4pals.com/favicon_light.png"
                                 alt="place4pals"
                                 border="0"
                                 height="50"
                                 width="50"
                                 style="display: block; font-family: arial; font-size: 15px; line-height: 15px; color: #000000; margin: 0;border: 1px solid white;">
                            <span style="margin-left:5px;font-family: arial; font-size: 35px; color: #000000;justify-self: flex-start;">
                                place4pals
                            </span>
                        </a>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px !important; background-color: #eeefff;"
                        class="sm-p bar">
                        <table border="0"
                               cellpadding="0"
                               cellspacing="0"
                               role="presentation"
                               style="width:100%;">
                            <tr>
                                <td style="font-family: arial; font-size: 15px; color: #000000; text-align: left;">
                                    ${body}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px !important;"
                        class="sm-p">
                        <table align="left"
                               border="0"
                               cellpadding="0"
                               cellspacing="0"
                               role="presentation"
                               width="100%">
                            <tr>
                                <td style="font-size: 10px; line-height: 15px; font-family: arial; color: #aaaaaa; text-align: center;"><a href="https://place4pals.com/donate">donate</a> | <a href="https://lambda.place4pals.com/public/unsubscribe?email=${email}">unsubscribe</a></td>
                            </tr>
                            <tr>
                                <td style="font-size: 10px; line-height: 15px; font-family: arial; color: #aaaaaa; text-align: center;">© ${new Date().getFullYear()} place4pals</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>
    </center>
</body>

</html>`;
};
