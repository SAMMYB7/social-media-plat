import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiResponse } from "shared/dist";
import { connectToDatabase, getDatabaseStatus } from "./db/connection";
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import uploadRouter from './routes/upload';
import { authenticate, requireRole } from './middleware/auth';

await connectToDatabase().catch(err => {
	console.error("[startup] DB connect failed", err);
});

export const app = new Hono()

app.use(cors())

app.get("/", (c) => {
	return c.text("Hello Hono!");
})

app.get("/hello", async (c) => {
	const data: ApiResponse = {
		message: "Hello BHVR!",
		success: true,
	};

	return c.json(data, { status: 200 });
})

// Auth routes
app.route('/auth', authRouter)

// User management routes
app.route('/users', usersRouter)

// File upload routes
app.route('/upload', uploadRouter)

// Example protected route for admin only
app.get('/admin/ping', authenticate, requireRole('admin'), (c) => {
  return c.json({ ok: true, scope: 'admin' });
})

// Simple DB status endpoint
app.get("/db-status", (c) => c.json(getDatabaseStatus()));

export default app;