# cypress-grafana-suite

Enterprise QA Observability framework integrating Cypress E2E testing with local Jenkins CI/CD pipelines and real-time InfluxDB + Grafana time-series telemetry.

![Cypress Code Engine](https://shields.io)
![CI/CD Automation](https://shields.io)
![Telemetry DB](https://shields.io)
![Analytics Hub](https://shields.io)

---

##  Architectural Topology

```plaintext
                   [ Local Machine Workspace ]
                               │
                               ▼
        ┌──────────────────────────────────────────────┐
        │       Jenkins CI/CD Automation Pipeline      │
        │  (Executes Asynchronous Cypress Elements)    │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼ (Extracts Metadata & Transforms JSON)
        ┌──────────────────────────────────────────────┐
        │   Node.js Parser / Custom Line Protocol Script │
        └──────────────────────┬───────────────────────┘
                               │
                               ▼ (Outbound Native HTTP POST Chunk)
        ┌──────────────────────────────────────────────┐
        │       Docker Compose Environment Sandbox     │
        │                                              │
        │   ┌──────────────────────────────────────┐   │
        │   │ InfluxDB OSS 2.7 Cluster Target      │   │
        │   │ (Stores Time-Series Metrics Data)    │   │
        │   └──────────────────┬───────────────────┘   │
        │                      │                       │
        │                      ▼ (Live Query Polling)  │
        │   ┌──────────────────────────────────────┐   │
        │   │ Grafana Analytics Dashboard Panel    │   │
        │   │ (Visual Aggregations for Executives) │   │
        │   └──────────────────────────────────────┘   │
        └──────────────────────────────────────────────┘
```


* **QA Infrastructure as Code:** The entire data warehousing backend (InfluxDB) and metrics dashboard interface engine (Grafana) are fully containerized and declared inline inside a clean `docker-compose.yml` file, allowing one-click localized environment setups.
* **Time-Series Telemetry Analysis:** Converts flat execution characteristics into multi-dimensional time-series metrics. Tracks runtime duration anomalies (`duration_ms`), build velocity trends, regression indexes, and network bottlenecks across subsequent code drops.
* **Brittle UI Element Resilience:** The embedded testing core explicitly targets advanced UI interaction patterns (Dynamic DOM IDs, asynchronous client-side API injection delays, and cross-viewport hidden scrolling layouts) via optimized selector matching architectures.
* **Decoupled Pipeline Integrity:** The `Jenkinsfile` workflow features structured recovery mechanisms (`|| true`), guaranteeing that telemetry pipelines execute and stream performance diagnostics out even if individual UI assertions encounter software application faults.

---

## 🛠️ Project Repository Tree

```plaintext
📁 cypress-grafana-suite/
├── 📁 cypress/
│   └── 📁 e2e/
│       └── 📄 playground.cy.js    # Advanced UI Test Sandbox Core Engine
├── 📄 .gitignore                  # Active build and local runtime exclusions
├── 📄 docker-compose.yml          # Self-contained telemetry infrastructure definition
├── 📄 Jenkinsfile                 # Orchestrated build step automation script
├── 📄 package.json                # Explicit platform development module map
└── 📄 README.md                   # Core structural pipeline project layout documentation
```

---

##  Execution & Verification Guide

### 1. Boot the Observability Datacenter
Initialize your global background tracking containers via terminal:
```bash
docker compose up -d
```

### 2. Configure Database Buckets
* Navigate to your browser endpoint: `http://localhost:8086`
* Initialize the database parameters:
  * **Organization:** `qa-automation`
  * **Initial Bucket Name:** `cypress_metrics`
* Generate an **All Access Token** via the interface and securely clone the token hash.

### 3. Connect the Analytics Visuals
* Navigate to your browser endpoint: `http://localhost:3000` (Default Credentials: `admin` / `admin`)
* Go to **Connections ➔ Data Sources ➔ Add Data Source ➔ InfluxDB**
* Shift Query Type to **Flux**, bind the internal destination path to `http://influxdb:8086`, and update target variables matching your token parameters.

### 4. Wire the Jenkins CI/CD Job
* Inject your token hash safely into Jenkins Credentials Manager as **Secret Text** under the key `influxdb-token`.
* Build a new **Pipeline Job**, define the SCM parameter to **Git**, paste your repository URL, and point the path script directly to your **`Jenkinsfile`**.
* Hit **Build Now** to execute the pipeline.

---

## 📊 Analytics Monitoring Core (Flux Query Blueprint)

To view real-time pipeline performance, attach this native analytical data collection query inside your active **Grafana Panel Visualization Window**:

```flux
from(bucket: "cypress_metrics")
  |> range(start: -7d)
  |> filter(fn: (r) => r["_measurement"] == "ui_playground")
  |> filter(fn: (r) => r["_field"] == "duration_ms" or r["_field"] == "passed" or r["_field"] == "failed")
```
