import app from "./app";
import { sequelize } from "./config/db";
import "./jobs/reminder.job";

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    await sequelize.sync({ alter: true });

    const PORT = Number(process.env.PORT) || 5000;

    app.listen({ port: PORT, host: "0.0.0.0" }, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
  }
};

start();
