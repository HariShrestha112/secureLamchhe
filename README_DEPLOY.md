# Local macOS build and deploy

This repository supports a simple local macOS workflow for building and running the frontend and backend together.

## Build and run locally

Use the user-mode helper script to build both apps and start the Spring Boot backend locally.

```bash
./scripts/run_local.sh
```

What this does:
- builds the Angular frontend
- packages the Spring Boot backend
- copies the jar to `~/.local/securelamchhe/app.jar`
- starts the app in the background with `nohup`
- writes logs to `~/.local/securelamchhe/out.log`

## Stop the local app

```bash
./scripts/stop_local.sh
```

## Verify the app

Open the browser to:

```bash
http://localhost:8080/
```

Or verify the backend endpoints:

```bash
curl http://localhost:8080/api/sewing-status
curl http://localhost:8080/api/user-profile
curl http://localhost:8080/api/getListofUnstichDress
```

## Rebuild after code changes

After changing frontend or backend code, run:

```bash
./scripts/run_local.sh
```

Then follow the log:

```bash
tail -f ~/.local/securelamchhe/out.log
```

## Notes for macOS

- You do not need `sudo` to run the local workflow.
- This is the preferred workflow for macOS development and testing.
- If you want a Linux-style production deployment, the repo also contains `deploy/securelamchhe.service` and `scripts/deploy_local.sh`, but that is not required for local macOS use.
