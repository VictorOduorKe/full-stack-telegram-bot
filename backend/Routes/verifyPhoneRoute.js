import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import asyncHandler from "express-async-handler";
import { authUser } from "../Routes/controllers/userController.js";

const verifyUserPhone = asyncHandler(async (req, res) => {
    await authUser(req, res); // ensures user is logged in

    const { phone, apiId, apiHash } = req.body;

    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!phone || !apiId || !apiHash) {
        return res.status(400).json({ message: "Phone, API ID, and API Hash are required" });
    }

    try {
        const stringSession = new StringSession(""); 
        const client = new TelegramClient(
            stringSession,
            parseInt(apiId),
            apiHash,
            { connectionRetries: 5 }
        );

        // Send login code
        const sentCode = await client.sendCodeRequest(phone);

        // Save temporary session in memory or DB if needed
        req.session.tempPhone = phone;
        req.session.tempApiId = apiId;
        req.session.tempApiHash = apiHash;
        req.session.phoneCodeHash = sentCode.phoneCodeHash;

        return res.status(200).json({
            message: "Code sent successfully",
            phoneCodeHash: sentCode.phoneCodeHash // optional if frontend needs it
        });

    } catch (err) {
        console.error("Verify phone error:", err);
        return res.status(500).json({ message: "Failed to send code", error: err.message });
    }
});

export default verifyUserPhone;
