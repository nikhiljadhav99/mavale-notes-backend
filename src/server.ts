import app from "./app";
import { sequelize } from "./config/db";
import "./jobs/reminder.job";

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    await sequelize.sync({ alter: true });

    await app.listen({ port: 5000 });
    console.log("Server running on http://localhost:5000");
  } catch (err) {
    console.error(err);
  }
};

start();
