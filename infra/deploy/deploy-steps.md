Deployment steps (student server)

Production on the student server must be done from Git, without Docker.

1. Pull the repository and checkout `main` or the approved stable branch.
2. Install Node.js LTS, nginx, and pm2 on the server.
3. Configure the MySQL database: create `SISIII2026_<student_number>` or use the provided server database.
4. In `backend/`, set env vars and run `npm ci`.
5. Import `backend/sql/schema.sql` with `phpMyAdmin` or the `mysql` client.
6. Start the backend with `pm2 start src/index.js --name flower-backend`.
7. In `frontend/`, set `VITE_API_URL` to the backend URL, run `npm ci`, then `npm run build`.
8. Configure nginx to serve `frontend/dist` and reverse-proxy `/api` to the backend port.

Local development may use Docker Compose.

1. Start the local MySQL and phpMyAdmin containers with `docker compose up -d` from `infra/`.
2. Use the local `.env` files for backend and frontend development.
3. Run the backend and frontend locally with `npm run dev` in each folder.

Note: Docker is for local development only. Do not deploy the student server with Docker unless the course coordinator explicitly approves it.
