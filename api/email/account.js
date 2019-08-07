const sgMail=require('@sendgrid/mail');
require('dotenv').config();
sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

const sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:"vivekmalumel@gmail.com",
        subject:"Thanks for joining in!",
        text:`Welcome to the app, ${name} Let me Know how you get along with the app.`
    })
}

const sendCancelEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:"vivekmalumel@gmail.com",
        subject:"Sorry to se you go!",
        text:`Good Bye, ${name} . I hope to see you back sometime soon.`
    })
}

module.exports={
    sendWelcomeEmail,
    sendCancelEmail
}

