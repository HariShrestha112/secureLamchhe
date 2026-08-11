## SecureLamchhe — Production build & deploy (simple)

Follow these exact steps from the repo root.

1) Prerequisites
- Install: Git, Docker, Node 18, npm, Java 17 JDK, Maven, ssh/scp.
- Have a container registry and credentials (Docker Hub, GHCR, ECR, etc.).

2) Build and package (local or CI)
- Recommended single command (uses `scripts/build_and_package.sh`):
```bash
./scripts/build_and_package.sh
```
- Outcome: `backend/target/backend-1.0.0-SNAPSHOT.jar` and frontend static copied into backend resources.

3) Build Docker image
- Build and tag:
```bash
docker build -f docker/Dockerfile -t myregistry/securelamchhe:1.0.0 .
```
- (Optional) Scan image:
```bash
trivy image myregistry/securelamchhe:1.0.0
```
- Push to registry:
```bash
docker push myregistry/securelamchhe:1.0.0
```

4) Quick smoke-run (verify)
```bash
docker run --rm -d --name securelamchhe -p 8080:8080 \
  -e JAVA_OPTS="-Xms256m -Xmx512m" \
  myregistry/securelamchhe:1.0.0
# then open http://localhost:8080
```

5) Deploy — choose one

- A: Run container on a single VM (recommended for stable single-host)
```bash
ssh user@prod 'docker pull myregistry/securelamchhe:1.0.0'
ssh user@prod "docker run -d --name securelamchhe --restart unless-stopped -p 8080:8080 -e JAVA_OPTS='-Xms256m -Xmx512m' myregistry/securelamchhe:1.0.0"
```

- B: Install JAR with systemd (repo contains `deploy/securelamchhe.service`)
```bash
scp backend/target/backend-1.0.0-SNAPSHOT.jar user@prod:/tmp/app.jar
ssh user@prod "sudo mkdir -p /opt/securelamchhe && sudo mv /tmp/app.jar /opt/securelamchhe/app.jar"
scp deploy/securelamchhe.service user@prod:/tmp/securelamchhe.service
ssh user@prod "sudo mv /tmp/securelamchhe.service /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable securelamchhe && sudo systemctl start securelamchhe"
```

- C: Kubernetes (for HA and autoscaling)
  - Use image `myregistry/securelamchhe:1.0.0` in your Deployment and add Service + Ingress.
  - Add readiness/liveness probes to hit your health endpoint (e.g., `/actuator/health`).
  - Example manifest lives in this README (see repo) or use the snippet in the original file.

6) CI/CD notes
- The repo has `.github/workflows/ci-cd.yml`. Ensure CI sets registry credentials as secrets and performs:
  - `scripts/build_and_package.sh`
  - `docker build` → `trivy scan` → `docker push`
  - deploy to staging and then to production with tagged images.

7) Rollback & checks
- Use immutable tags and keep previous tags for rollback.
- Kubernetes: `kubectl rollout undo deployment/<name>`.
- Verify logs: `docker logs -f securelamchhe` or `journalctl -u securelamchhe -f` on JAR installs.

8) Quick post-deploy checklist
- Health endpoint reachable.
- Secrets injected securely (do not commit).
- Monitoring and alerts configured.
- Backups for databases and critical data.

Files to inspect:
- `docker/Dockerfile` (multi-stage image)
- `scripts/build_and_package.sh` (local build steps)
- `.github/workflows/ci-cd.yml` (CI pipeline)
- `deploy/securelamchhe.service` (systemd example)

---
Generated on: 2026-08-10
