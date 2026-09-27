import { Bot } from "grammy";
import * as downloader from "ab-downloader";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot(token);

// Command /start
bot.command("start", (ctx) => {
  ctx.reply(
    "👋 **Universal Media Downloader Bot**\n\n" +
    "Kirimkan link dari platform apa saja (TikTok, Instagram, YouTube, Spotify, dll), dan saya akan mendownloadnya untuk Anda!"
  );
});

// Handler pesan teks dengan proteksi anti-loop
bot.on("message:text", async (ctx) => {
  if (ctx.from?.is_bot) return; // Abaikan pesan dari bot

  const text = ctx.message.text.trim();
  if (!text.startsWith("http://") && !text.startsWith("https://")) {
    await ctx.reply("⚠️ Mohon kirimkan link/URL yang valid (diawali http:// atau https://).");
    return;
  }

  await ctx.reply("⏳ Sedang memproses media, mohon tunggu sebentar...");

  try {
    let res: any = null;

    // Routing otomatis berdasarkan domain URL
    if (text.includes("tiktok.com") || text.includes("vm.tiktok.com")) {
      res = await downloader.tiktok(text);
    } else if (text.includes("instagram.com")) {
      res = await downloader.igdl(text);
    } else if (text.includes("facebook.com") || text.includes("fb.watch")) {
      res = await downloader.fbdown(text);
    } else if (text.includes("youtube.com") || text.includes("youtu.be")) {
      res = await downloader.youtube(text);
    } else if (text.includes("spotify.com")) {
      res = await downloader.spotify(text);
    } else if (text.includes("pinterest.com") || text.includes("pin.it")) {
      res = await downloader.pinterest(text);
    } else {
      res = await downloader.aio(text); // Fallback Universal Downloader
    }

    const mediaUrl =
      res?.result?.video ||
      res?.result?.url ||
      res?.video ||
      res?.url ||
      res?.audio ||
      res?.result?.audio ||
      (Array.isArray(res?.result) ? res.result[0]?.url : null);

    if (mediaUrl) {
      if (text.includes("spotify")) {
        await ctx.replyWithAudio(mediaUrl, { caption: "✅ Audio berhasil didownload!" });
      } else if (text.includes("pinterest") && !mediaUrl.endsWith(".mp4")) {
        await ctx.replyWithPhoto(mediaUrl, { caption: "✅ Gambar berhasil didownload!" });
      } else {
        await ctx.replyWithVideo(mediaUrl, { caption: "✅ Media berhasil didownload!" });
      }
    } else {
      await ctx.reply("❌ Gagal mengekstrak media. Pastikan link bersifat publik dan aktif.");
    }
  } catch (error) {
    console.error("Downloader error:", error);
    await ctx.reply("❌ Terjadi kesalahan saat memproses link tersebut.");
  }
});

// Jalankan bot dengan Long Polling (Sangat stabil di Render)
bot.start();
console.log("🤖 Bot Telegram berhasil berjalan (Long Polling Mode)!");
