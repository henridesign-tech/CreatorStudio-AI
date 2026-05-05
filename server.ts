import express, { Request, Response, NextFunction } from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ dest: "uploads/" });
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    // The SDK will automatically pick up a valid GOOGLE_API_KEY
    // or GEMINI_API_KEY from the environment now that placeholders are removed.
    aiClient = new GoogleGenAI({});
  }
  return aiClient;
}

// Constants
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "henridesign581@gmail.com";
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

// Cleanup invalid Gemini API key placeholders from environment
if (process.env.GEMINI_API_KEY === "AI Studio Free Tier") {
  delete process.env.GEMINI_API_KEY;
}
if (process.env.GOOGLE_API_KEY === "AI Studio Free Tier") {
  delete process.env.GOOGLE_API_KEY;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2025-01-27.acacia" as any,
});

// Mock Promo Codes
const PROMO_CODES: Record<string, { plan: "premium" | "lifetime", durationDays: number }> = {
  "FOUNDER2026": { plan: "lifetime", durationDays: 36500 },
  "VIPACCESS": { plan: "premium", durationDays: 30 },
};

// In-memory Database (simplified for demo)
let users: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- MIDDLEWARES ---

  const authenticate = (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = users.find(u => u.id === decoded.id);
      if (!req.user) return res.status(401).json({ error: "User not found" });
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };

  const requirePremium = (req: any, res: Response, next: NextFunction) => {
    if (req.user.role === "admin") return next();
    if (req.user.plan !== "free" && req.user.subscription_status === "active") return next();
    res.status(403).json({ error: "Premium access required" });
  };

  const requireAdmin = (req: any, res: Response, next: NextFunction) => {
    if (req.user.role === "admin") return next();
    res.status(403).json({ error: "Admin access required" });
  };

  // --- AUTH ROUTES ---

  app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // On force la vérification en minuscules pour éviter les erreurs de saisie
    const isFounder = email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: isFounder ? "admin" : "user",
      plan: isFounder ? "lifetime" : "free",
      subscription_status: isFounder ? "active" : "inactive",
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    
    const { password: _, ...userWithoutPassword } = newUser;
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: "7d" });
    
    res.json({ user: userWithoutPassword, token });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email.toLowerCase().trim());
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Force Admin sync on login for the Founder email
    if (user.email === ADMIN_EMAIL.toLowerCase().trim()) {
      user.role = "admin";
      user.plan = "lifetime";
      user.subscription_status = "active";
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
    
    res.json({ user: userWithoutPassword, token });
  });

  app.get("/api/auth/me", authenticate, (req: any, res) => {
    // Force Admin sync on "me" check as well
    if (req.user.email === ADMIN_EMAIL.toLowerCase().trim()) {
      req.user.role = "admin";
      req.user.plan = "lifetime";
      req.user.subscription_status = "active";
    }
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  });

  // --- SUBSCRIPTION & PROMO ---

  app.post("/api/subscription/promo", authenticate, (req: any, res) => {
    const { code } = req.body;
    const promo = PROMO_CODES[code];
    
    if (!promo) return res.status(400).json({ error: "Invalid promo code" });

    req.user.plan = promo.plan;
    req.user.subscription_status = "active";
    
    res.json({ message: "Promo code applied!", user: req.user });
  });

  app.post("/api/subscription/checkout", authenticate, async (req: any, res) => {
    // In a real app, this would create a Stripe checkout session
    // For now, we'll simulate a successful payment for demonstration
    req.user.plan = "premium";
    req.user.subscription_status = "active";
    res.json({ message: "Subscription activated!", user: req.user });
  });

  // --- ADMIN ROUTES ---

  app.get("/api/admin/stats", authenticate, requireAdmin, (req, res) => {
    res.json({
      totalUsers: users.length,
      premiumUsers: users.filter(u => u.plan !== "free").length,
      revenue: users.filter(u => u.plan === "premium").length * 19, // Mock $19/mo
      recentActivity: users.slice(-5).map(u => ({ email: u.email, action: "Registered", date: u.created_at }))
    });
  });

  // --- PROTECTED FEATURE EXAMPLE ---
  app.get("/api/features/premium-only", authenticate, requirePremium, (req, res) => {
    res.json({ message: "Welcome to the premium feature!" });
  });

  app.post("/api/design/generate", authenticate, upload.single("image"), async (req: any, res) => {
    const { prompt, designType, style } = req.body;
    const file = req.file;

    try {
      const parts: any[] = [{ text: `Task: Create a ${designType}. Style: ${style}. Prompt: ${prompt}. Quality: 4k` }];
      
      if (file) {
        const image = fs.readFileSync(file.path);
        parts.push({
          inlineData: {
            data: image.toString("base64"),
            mimeType: file.mimetype,
          },
        });
        fs.unlinkSync(file.path);
      }

      const result = await getAI().models.generateContent({
        model: "gemini-2.0-flash",
        contents: [{ parts }],
      });

      res.json({ message: "Generation started", result: "Image generation model integration would go here" });
    } catch (err: any) {
      console.error(err);
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      res.status(500).json({ error: "Failed to generate", details: err.message });
    }
  });

  app.post("/api/video/analyze", authenticate, upload.single("video"), async (req: any, res) => {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    try {
      const videoData = fs.readFileSync(file.path);
      const mimeType = file.mimetype;

      const result = await getAI().models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: videoData.toString("base64"),
                  mimeType,
                },
              },
              {
                text: "Transcribe this video and return the subtitles in JSON format: { subtitles: [{id: string, start: number, end: number, text: string}] } for each sentence found. Ensure timecodes are accurate and text is in uppercase.",
              },
            ],
          },
        ],
      });

      const responseText = result.candidates[0].content.parts[0].text || "";
      const jsonStr = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const subtitles = JSON.parse(jsonStr);

      fs.unlinkSync(file.path);
      res.json(subtitles);
    } catch (err: any) {
      console.error(err);
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      res.status(500).json({ error: "Failed to analyze video", details: err.message });
    }
  });

  app.post("/api/video/generate", authenticate, upload.single("image"), async (req: any, res) => {
    const { prompt } = req.body;
    const file = req.file;

    try {
      const parts: any[] = [{ text: `Task: Create a video. Prompt: ${prompt}. Quality: 4k, cinematic.` }];
      
      if (file) {
        const image = fs.readFileSync(file.path);
        parts.push({
          inlineData: {
            data: image.toString("base64"),
            mimeType: file.mimetype,
          },
        });
        fs.unlinkSync(file.path);
      }

      res.json({ message: "Video generation started", result: "Placeholder for video generation URL" });
    } catch (err: any) {
      console.error(err);
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      res.status(500).json({ error: "Failed to generate video", details: err.message });
    }
  });

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
