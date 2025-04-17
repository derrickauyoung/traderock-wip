// email.js

export async function sendMail(buyerEmail, sellerName, itemTitle, price, ccEmails=[]) {

    await fetch("https://napmuiqctvbegldujfbb/functions/v1/send-confirmation-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        buyerEmail,
        sellerName,
        itemTitle,
        price,
        ccEmails
        }),
    });

}