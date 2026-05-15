import Fastify from "fastify";
import notesRoutes from "./modules/notes/notes.routes";
import authRoutes from "./modules/auth/auth.routes";
import transactionRoutes from "./modules/transactions/transaction.routes";
import userRoutes from "./modules/user/user.routes";

import jwtPlugin from "./plugins/jwt";
import corsPlugin from "./plugins/cors";
import swaggerPlugin from "./plugins/swagger";
import rateLimitPlugin from "./plugins/rateLimit";

const app = Fastify({ logger: true });

app.register(corsPlugin);
app.register(rateLimitPlugin);
app.register(jwtPlugin);
app.register(swaggerPlugin);

app.register(authRoutes);
app.register(userRoutes);
app.register(notesRoutes);
app.register(transactionRoutes);

export default app;
