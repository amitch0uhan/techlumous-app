// PM2 process config. Shipped inside every release, so __dirname is that
// release's own folder (/var/www/techlumous-app/releases/<id>), never the
// `current` symlink — PM2 always runs exactly the release it was started from.
module.exports = {
  apps: [
    {
      name: "techlumous-app",
      cwd: __dirname,
      script: "server.js",
      // Runtime secrets live on the VPS only, outside the release folders.
      node_args: `--env-file=${__dirname}/../../shared/.env`,
      exec_mode: "fork",
      instances: 1,
      max_memory_restart: "1G",
      time: true,
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        // Listen on localhost only; Nginx is the public entry point.
        HOSTNAME: "127.0.0.1",
      },
    },
  ],
}
