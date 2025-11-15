import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import asyncHandler from "express-async-handler";
import { getLoggedInUser } from "../utils/getLoggedInUser.js";

const extractRetrySeconds = (err) => {
  if (typeof err?.message === 'string' && err.message.includes('A wait of')) {
    const m = err.message.match(/A wait of (\d+) seconds/);
    return m ? parseInt(m[1], 10) : null;
  }
  return null;
};

const verifyUserPhone = asyncHandler(async (req, res) => {
  const user = await getLoggedInUser(req);
  const { phone, apiId, apiHash } = req.body;

  if (!user) return res.status(401).json({ message: "Unauthorized" });
  if (!phone || !apiId || !apiHash) {
    return res.status(400).json({ message: "Phone, API ID, and API Hash are required" });
  }

  if (isNaN(parseInt(apiId))) {
    return res.status(400).json({ message: "Invalid API ID - must be a number" });
  }

  if (!apiHash || apiHash.length < 32) {
    return res.status(400).json({ message: "Invalid API Hash" });
  }

  let client;
  try {
    console.log(`📱 Verifying phone: ${phone}`);
    
    client = new TelegramClient(new StringSession(""), parseInt(apiId), apiHash, { connectionRetries: 5 });

    console.log("🔗 Connecting...");
    await client.connect();

    console.log("📤 Requesting code...");
    let codeRequestedOnce = false;

    try {
      await client.start({
        phoneNumber: phone,
        phoneCode: async () => {
          // Only throw once on first call - signal that code is needed
          if (!codeRequestedOnce) {
            codeRequestedOnce = true;
            console.log("✅ Code requested by Telegram");
            throw new Error("CODE_NEEDED");
          }
          // On subsequent calls (shouldn't happen), return empty to prevent looping
          return "";
        },
        password: async () => "",
      });
    } catch (e) {
      // Only re-throw if it's NOT our "CODE_NEEDED" signal
      if (e.message !== "CODE_NEEDED") {
        throw e;
      }
    }

    if (!codeRequestedOnce) throw new Error("Code request failed");

    console.log("💾 Saving session...");
    const sessionString = client.session.save();
    
    user.telegramSession = sessionString;
    user.telegramPhone = phone;
    await user.save();

    // Disconnect gracefully
    try {
      await client.disconnect();
    } catch (e) {
      console.log("Disconnect note:", e?.message);
    }

    return res.status(200).json({
      message: "Code sent to your Telegram! Enter the code in the next step.",
      success: true
    });

  } catch (err) {
    console.error("❌ Error verifying phone:", err);

    // Check for Telegram rate-limit / sign-in wait
    const retrySeconds = extractRetrySeconds(err);
    if (retrySeconds) {
      const minutes = Math.ceil(retrySeconds / 60);
      console.log(`⏳ Rate-limit: wait ${retrySeconds} seconds (${minutes} minutes)`);
      return res.status(429).json({
        message: `Too many attempts. Please wait ${minutes} minute(s) before retrying.`,
        retryAfter: retrySeconds,
      });
    }

    if (err.message && err.message.includes('API_ID')) {
      return res.status(400).json({ message: 'Invalid API credentials' });
    }

    return res.status(500).json({ message: 'Failed to verify phone', error: err.message || err });
  }
});

const deleteMessage = asyncHandler(async (req, res) => {
  const user = await getLoggedInUser(req);

  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const { phone, apiId, apiHash, code, password } = req.body;
  if (!phone || !apiId || !apiHash || !code) {
    return res.status(400).json({ message: "All fields required" });
  }

  let client;
  try {
    console.log("🔐 Authenticating with code...");
    const sessionString = user.telegramSession || "";
    client = new TelegramClient(new StringSession(sessionString), parseInt(apiId), apiHash, { connectionRetries: 5 });

    await client.connect();
    console.log("✅ Connected");

    await client.start({
      phoneNumber: phone,
      phoneCode: async () => code,
      password: async () => password || ""
    });

    console.log("✅ Authenticated successfully");

    user.telegramSession = client.session.save();
    await user.save();

    console.log("🗑️ Fetching dialogs...");
    const dialogs = await client.getDialogs({ limit: 50 });
    let deletedCount = 0;

    for (const dialog of dialogs) {
      const messages = await client.getMessages(dialog.id, { limit: 100 });
      const toDelete = messages.filter(m => m.message?.includes("joined Telegram")).map(m => m.id);
      
      if (toDelete.length) {
        await client.deleteMessages(dialog.id, toDelete);
        deletedCount += toDelete.length;
      }
    }

    console.log(`✅ Deleted ${deletedCount} messages`);

    try {
      await client.disconnect();
    } catch (e) {
      console.log("Disconnect note:", e?.message);
    }

    return res.status(200).json({ message: "Messages deleted successfully", deletedCount });
  } catch (err) {
    console.error("❌ Delete error:", err.message);

    // Check for Telegram rate-limit / sign-in wait
    const retrySeconds = extractRetrySeconds(err);
    if (retrySeconds) {
      const minutes = Math.ceil(retrySeconds / 60);
      console.log(`⏳ Rate-limit: wait ${retrySeconds} seconds`);
      return res.status(429).json({
        message: `Telegram rate-limited. Please wait ${minutes} minute(s) before retrying.`,
        retryAfter: retrySeconds,
      });
    }

    return res.status(500).json({ message: "Failed to delete messages", error: err.message });
  }
});

const verifyUserPhoneDebug = asyncHandler(async (req, res) => {
  const { phone, apiId, apiHash } = req.body;

  if (!phone || !apiId || !apiHash) {
    return res.status(400).json({ message: "Phone, API ID, and API Hash are required" });
  }

  if (isNaN(parseInt(apiId))) {
    return res.status(400).json({ message: "Invalid API ID - must be a number" });
  }

  if (!apiHash || apiHash.length < 32) {
    return res.status(400).json({ message: "Invalid API Hash" });
  }

  let client;
  try {
    console.log(`📱 [DEBUG] Verifying phone: ${phone}`);
    
    client = new TelegramClient(new StringSession(""), parseInt(apiId), apiHash, { connectionRetries: 5 });

    console.log("🔗 [DEBUG] Connecting...");
    await client.connect();

    console.log("📤 [DEBUG] Requesting code...");
    let codeRequestedOnce = false;

    try {
      await client.start({
        phoneNumber: phone,
        phoneCode: async () => {
          if (!codeRequestedOnce) {
            codeRequestedOnce = true;
            console.log("✅ [DEBUG] Code requested");
            throw new Error("CODE_NEEDED");
          }
          return "";
        },
        password: async () => "",
      });
    } catch (e) {
      if (e.message !== "CODE_NEEDED") {
        throw e;
      }
    }

    if (!codeRequestedOnce) throw new Error("Code request failed");

    console.log("✅ [DEBUG] Saving session");
    const sessionString = client.session.save();

    try {
      await client.disconnect();
    } catch (e) {
      console.log("Disconnect note:", e?.message);
    }

    return res.status(200).json({
      message: "Code sent to your Telegram!",
      success: true
    });

  } catch (err) {
    console.error("❌ [DEBUG] Error verifying phone:", err);

    const retrySeconds = extractRetrySeconds(err);
    if (retrySeconds) {
      const minutes = Math.ceil(retrySeconds / 60);
      console.log(`⏳ [DEBUG] Rate-limit: ${minutes} minute(s)`);
      return res.status(429).json({
        message: `Too many attempts. Please wait ${minutes} minute(s) before retrying.`,
        retryAfter: retrySeconds,
      });
    }

    if (err.message && err.message.includes('API_ID')) {
      return res.status(400).json({ message: 'Invalid API credentials' });
    }

    return res.status(500).json({ message: 'Failed to verify phone', error: err.message || err });
  }
});

export { deleteMessage, verifyUserPhone, verifyUserPhoneDebug };
