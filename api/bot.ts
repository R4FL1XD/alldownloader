import { Bot, webhookCallback } from "grammy";
import * as downloader from "ab-downloader";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN is unset");

const bot = new Bot(token);

// Command /start
bot.command("start", (ctx) => {
  ctx.reply(
    "👋 **Universal Media Downloader Bot**\n\n" +
    "Kirimkan link dari platform apa saja, dan saya akan mendownloadnya untuk Anda:\n\n" +
    "• TikTok, Instagram, Facebook, YouTube\n" +
    "• Spotify, SoundCloud, Threads, Twitter/X\n" +
    "• Pinterest, RedNote, CapCut, MediaFire, GDrive, dll."
  );
});

// Handler pesan teks (Deteksi Link & Ekstraksi Media)
bot.on("message:text", async (ctx) => {
  const text = ctx.message.text.trim();

  // Validasi URL
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
    } else if (text.includes("facebook.com") || text.includes("fb.watch") || text.includes("fb.me")) {
      res = await downloader.fbdown(text);
    } else if (text.includes("youtube.com") || text.includes("youtu.be")) {
      res = await downloader.youtube(text);
    } else if (text.includes("spotify.com")) {
      res = await downloader.spotify(text);
    } else if (text.includes("threads.net")) {
      res = await downloader.threads(text);
    } else if (text.includes("soundcloud.com") || text.includes("snd.sc")) {
      res = await downloader.soundcloud(text);
    } else if (text.includes("xiaohongshu.com") || text.includes("xhslink.com")) {
      res = await downloader.rednote(text);
    } else if (text.includes("twitter.com") || text.includes("x.com")) {
      res = await downloader.twitter(text);
    } else if (text.includes("pinterest.com") || text.includes("pin.it")) {
      res = await downloader.pinterest(text);
    } else if (text.includes("capcut.com")) {
      res = await downloader.capcut(text);
    } else if (text.includes("mediafire.com")) {
      res = await downloader.mediafire(text);
    } else if (text.includes("drive.google.com")) {
      res = await downloader.gdrive(text);
    } else if (text.includes("douyin.com")) {
      res = await downloader.douyin(text);
    } else if (text.includes("cocofun")) {
      res = await downloader.cocofun(text);
    } else if (text.includes("snackvideo")) {
      res = await downloader.snackvideo(text);
    } else if (text.includes("kuaishou")) {
      res = await downloader.kuaishou(text);
    } else {
      // Fallback universal downloader untuk platform lainnya
      res = await downloader.aio(text);
    }

    // Ekstraksi URL media secara universal dari respons package
    const mediaUrl =
      res?.result?.video ||
      res?.result?.url ||
      res?.video ||
      res?.url ||
      res?.audio ||
      res?.result?.audio ||
      (Array.isArray(res?.result) ? res.result[0]?.url : null);

    if (mediaUrl) {
      // Mengirimkan media sesuai format jenis file
      if (text.includes("spotify") || text.includes("soundcloud")) {
        await ctx.replyWithAudio(mediaUrl, { caption: "✅ Audio berhasil didownload!" });
      } else if (text.includes("pinterest") && !mediaUrl.endsWith(".mp4")) {
        await ctx.replyWithPhoto(mediaUrl, { caption: "✅ Gambar berhasil didownload!" });
      } else if (text.includes("mediafire") || text.includes("drive.google")) {
        await ctx.replyWithDocument(mediaUrl, { caption: "✅ File berhasil didownload!" });
      } else {
        await ctx.replyWithVideo(mediaUrl, { caption: "✅ Media berhasil didownload!" });
      }
    } else {
      await ctx.reply("❌ Gagal mengekstrak media. Pastikan link bersifat publik dan aktif.");
    }
  } catch (error) {
    console.error("Downloader error:", error);
    await ctx.reply("❌ Terjadi kesalahan sistem saat memproses link tersebut.");
  }
});

// Export webhook callback untuk Vercel
export default webhookCallback(bot, "https");
