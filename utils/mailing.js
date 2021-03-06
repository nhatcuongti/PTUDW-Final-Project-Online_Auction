import nodemailer from 'nodemailer';

export default {
    async sendEmail(email, subject, text) {
        try {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: 'onlineauction.mailing@gmail.com',
                    pass: 'onlineauction123',
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            await transporter.sendMail({
                from: 'Mailing System <onlineauction.mailing@gmail.com>',
                to: email,
                subject: subject,
                text: text
            });
        } catch (e) {
            console.log(e);
        }
    }
};