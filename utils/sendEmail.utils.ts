import { SendMailClient } from "zeptomail";


const url = "https://api.zeptomail.in/v1.1/email";
const token = "Zoho-enczapikey PHtE6r1bE+3vg2cm8hIH4vPsEs73Z4Iv9LljJAFDs90TX6BRH01RqIstxGO++RktV/AQEqXOzdo95brJu++CdD67NT5MWGqyqK3sx/VYSPOZsbq6x00asFoZfkDUVY7od9Zs1CfQu9aX";

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
