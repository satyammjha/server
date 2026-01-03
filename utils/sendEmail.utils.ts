import { SendMailClient } from "zeptomail";


const url = "https://api.zeptomail.in/v1.1/email";
const token = process.env.Z_TOKN || ''

let client = new SendMailClient({ url, token });

export const sendEmail = async (
    emailId: string,
    name: string,
    html: string
) => {
    await client.sendMail({
        from: {
            address: "noreply@zobly.in",
            name: "Zobly Jobs",
        },
        to: [
            {
                email_address: {
                    address: emailId,
                    name,
                },
            },
        ],
        subject: "New job matches your profile",
        htmlbody: html,
    });
};
