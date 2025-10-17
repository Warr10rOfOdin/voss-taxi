# VT Patch Desk v0.1.1
A tiny local GUI to manage your patches and rollbacks in the Voss Taxi repo.

## Install & run
```powershell
cd tools/vt-desk
npm i
npm start
# Open http://localhost:5177
```

## What it can do
- Upload a **patch manifest** (`patches/*.json`).
- **Dry-run** or **apply** a patch (calls `tools/vt/patcher.cjs`).
- Create a **snapshot** (calls `tools/vt/snapshot.cjs`).
- **Rollback** to any snapshot (GUI copies from `releases/<snapshot>`).
- View **CHANGELOG-*.md** files.
- Optional **Git commit + push** with an optional tag.

> Run the server **from your project root** so paths resolve correctly.
