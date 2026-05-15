import app from "./app";
import { sequelize } from "./config/db";
import "./jobs/reminder.job";

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    // ⚠️ Avoid alter in production (can break DB)
    await sequelize.sync();

    const PORT = Number(process.env.PORT) || 5000;

    await app.listen({
      port: PORT,
      host: "0.0.0.0",
    });

    console.log(`🚀 Server running on port ${PORT}`);
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1); // important for Render restart
  }
};

start();