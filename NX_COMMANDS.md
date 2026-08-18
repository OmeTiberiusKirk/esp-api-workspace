# Nx Command Cheatsheet

รวมคำสั่ง Nx ที่ใช้บ่อยในโปรเจกต์นี้ ตั้งแต่ติดตั้ง dependency จนถึง build/deploy

Projects ในเวิร์กสเปซ: `@esp/api-gateway`, `@esp/auth-service`, `@esp/master-service`, `@esp/mailer-service`, `@esp/shared`

> ⚠️ ชื่อ project คือชื่อเต็มใน `package.json` (เช่น `@esp/api-gateway`) ไม่ใช่ `api-gateway` เฉยๆ ใช้ `pnpm nx show projects` เพื่อดูชื่อทั้งหมดถ้าไม่แน่ใจ

---

## 📦 ติดตั้ง Package

```bash
# ติดตั้งเข้า root workspace (dev tools, nx plugins ฯลฯ)
pnpm add -w <package>
pnpm add -Dw <package>

# ติดตั้งเข้า app/lib ที่ระบุ
pnpm add <package> --filter @esp/api-gateway
pnpm add -D <package> --filter @esp/api-gateway

# ติดตั้งเข้า package ที่ใช้ร่วมกันหลาย service (ผ่าน pnpm catalog ใน pnpm-workspace.yaml)
# 1. เพิ่ม version ใน pnpm-workspace.yaml ภายใต้ catalog:
# 2. ใช้ "<package>": "catalog:" ใน dependencies ของแต่ละ app/lib
pnpm install
```

---

## 🧭 สำรวจ Workspace

```bash
pnpm nx show projects              # ลิสต์ชื่อ project ทั้งหมด
pnpm nx show project @esp/api-gateway --json   # ดู targets/config ของ project นั้น
pnpm nx graph                       # เปิด dependency graph แบบ visual
pnpm nx affected:graph              # ดูเฉพาะ project ที่ได้รับผลกระทบจาก diff ปัจจุบัน
```

---

## ⚙️ Generate (Scaffolding)

```bash
# NestJS module/service/controller ในแอปที่ระบุ
pnpm nx g @nx/nest:module <name> --project=@esp/auth-service
pnpm nx g @nx/nest:service <name> --project=@esp/auth-service
pnpm nx g @nx/nest:controller <name> --project=@esp/auth-service

# สร้าง app/lib ใหม่
pnpm nx g @nx/node:app <name>
pnpm nx g @nx/js:lib packages/<name>

# ตั้งค่า Docker build ให้ project ใดๆ (สร้าง Dockerfile + docker:build target)
pnpm nx g @nx/node:setup-docker --project=@esp/<app-name>
```

---

## ▶️ Serve (รันแบบ dev/watch)

```bash
pnpm nx serve @esp/api-gateway
pnpm nx serve @esp/auth-service
pnpm nx serve @esp/master-service
pnpm nx serve @esp/mailer-service

pnpm nx run-many --target=serve --all      # รันทุกแอปพร้อมกัน
pnpm run serve                              # เทียบเท่าอันบน (shortcut ใน package.json)
```

---

## 🏗️ Build

```bash
pnpm nx build @esp/api-gateway
pnpm nx run-many --target=build --all      # build ทุกโปรเจกต์
pnpm nx affected --target=build            # build เฉพาะโปรเจกต์ที่ได้รับผลกระทบจาก diff

# shortcut ที่มีอยู่แล้วใน package.json
pnpm run build
pnpm run build:affected
pnpm run build:api-gateway
```

---

## 🧪 Test / Lint

```bash
pnpm nx test @esp/api-gateway
pnpm nx run-many --target=test --all
pnpm nx affected --target=test

pnpm nx lint @esp/api-gateway
pnpm nx run-many --target=lint --all

pnpm nx e2e @esp/api-gateway-e2e          # ถ้ามี e2e project (ตอนนี้ยังไม่มีในเวิร์กสเปซ)
```

---

## 🐳 Docker

```bash
# build image ของแต่ละ service (ต้องมี Dockerfile จาก setup-docker ก่อน)
pnpm nx docker:build @esp/api-gateway
pnpm nx docker:build @esp/auth-service
pnpm nx docker:build @esp/master-service
pnpm nx docker:build @esp/mailer-service

pnpm nx run-many --target=docker:build --all

# รัน container ที่ build เสร็จแล้ว
pnpm nx docker:run @esp/api-gateway -p 3000:3000

# เตรียม dist แบบ standalone (ไม่ผ่าน docker) — ใช้ตรวจสอบก่อน build image ก็ได้
pnpm nx run @esp/api-gateway:prune
```

> รายละเอียดปัญหาที่เจอตอน build จริง (pnpm catalog protocol / ignored build scripts) และวิธีแก้ ดูใน [apps/api-gateway/Dockerfile](apps/api-gateway/Dockerfile) (comment ในไฟล์) และ [packages/shared/package.json](packages/shared/package.json)

---

## 🧹 Cache / Maintenance

```bash
pnpm nx reset                       # ล้าง Nx cache ทั้งหมด (ใช้เมื่อ build/lint ค้างหรือผลลัพธ์แปลกๆ)
pnpm nx format:write                # format โค้ดทั้งเวิร์กสเปซด้วย prettier ผ่าน nx
pnpm nx format:check                # เช็คว่ามีไฟล์ที่ format ไม่ตรง spec หรือไม่
pnpm nx list                         # ลิสต์ plugin ที่ติดตั้งในเวิร์กสเปซ
pnpm nx list @nx/node                # ดู generator/executor ที่ plugin นั้นมี
```

---

## 💡 Tips

- ใช้ `nx run <project>:<target>` เป็น syntax กลางเวลาจำชื่อ shortcut ไม่ได้ เช่น `pnpm nx run @esp/api-gateway:build`
- ใส่ `--verbose` ต่อท้ายคำสั่งไหนก็ได้เวลา debug ปัญหา build/generator
- `nx affected` ใช้ git diff เทียบกับ base branch (`main` โดย default) เพื่อรันเฉพาะโปรเจกต์ที่เปลี่ยน — ประหยัดเวลาใน CI
