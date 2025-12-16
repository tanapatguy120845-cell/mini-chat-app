# MINI-CHAT-APP

#Frontend Repo
https://github.com/tanapatguy120845-cell/frontend

โปรเจคตัวอย่าง "Mini Chat App" — แอปแชทเล็ก ๆ ที่ใช้ Next.js (frontend) เป็น UI และ Express + MongoDB (backend) ในการเก็บประวัติข้อความ และเรียกใช้โมเดล AI (ผ่าน Ollama) เพื่อให้ตอบกลับ

## สรุปสั้น ๆ
- Frontend: Next.js (React) อยู่ในโฟลเดอร์ `frontend`
- Backend: Express + Mongoose อยู่ในโฟลเดอร์ `backend`
- แอปจะเก็บข้อความ (user / ai) ลง MongoDB และเมื่อผู้ใช้ส่งข้อความ backend จะเรียกไปยังบริการ AI (โปรเจคนี้ใช้ endpoint ของ Ollama ที่รันบน `localhost:11434`) เพื่อดึงคำตอบกลับ

## จุดเด่น / ฟีเจอร์
- โหลดประวัติแชทจากฐานข้อมูล (GET /api/chat)
- ส่งข้อความใหม่ไปยัง AI แล้วบันทึกทั้ง user/ai ลง MongoDB (POST /api/chat)
- Frontend มีปุ่ม Clear chat (frontend เรียก DELETE /api/chat — โปรดดูหมายเหตุด้านล่าง)

## โครงสร้างโฟลเดอร์ (สำคัญ)
```
backend/
  package.json
  src/
    index.js           # express app
    models/Message.js  # mongoose model
    routes/chat.js     # API routes (GET, POST)
    services/ollama.js # (มีอยู่แต่ไม่ได้ใช้ใน routes ข้างต้น)

frontend/
  package.json
  src/app/page.js     # หน้า UI (Next.js)
```

## ข้อที่ต้องรู้จากโค้ดที่อ่าน
- Backend เชื่อมกับ MongoDB ด้วย `process.env.MONGO_URI` และรันบนพอร์ต `process.env.PORT || 5000` (ค่าเริ่มต้น 5000)
- `backend/src/routes/chat.js` ทำงานดังนี้:
  - GET `/api/chat` => ดึงประวัติจาก MongoDB (เรียงตาม createdAt)
  - POST `/api/chat` => รับ `{ message }` จาก body, เก็บเป็น `user` message, เรียก `http://localhost:11434/api/chat` (Ollama) เพื่อรับ response, แล้วบันทึก `ai` message
  - ไม่มีการ implement `DELETE /api/chat` ใน backend (แต่ frontend เรียก `DELETE` เพื่อเคลียร์) — ดูหมายเหตุ
- Frontend fetches จาก `http://localhost:5000/api/chat` (GET/POST/DELETE)
- Ollama expected: local server at `http://localhost:11434` (เรียก model `llama3` ในโค้ดตัวอย่าง)

## ความต้องการ (Requirements)
- Node.js (แนะนำ v18+)
- npm หรือ pnpm
- MongoDB (local หรือ MongoDB Atlas)
- Ollama หรือบริการ AI ที่ expose endpoint แบบเดียวกับตัวอย่าง (ถ้าไม่ใช้ Ollama ต้องแก้ URL/format ใน backend)

## ตัวแปรแวดล้อม (.env)
สร้างไฟล์ `.env` ใน `backend/` และกำหนดค่าสำคัญดังนี้:

```
MONGO_URI=mongodb://localhost:27017/mini-chat-app
PORT=5000
# อื่น ๆ ที่ต้องการ (เช่น คีย์ สำหรับบริการ AI ถ้าไม่ใช้ Ollama)
```

## ติดตั้งและรัน (เครื่อง local)
1) Backend

- เข้าไปที่โฟลเดอร์ backend:

```bash
cd backend
npm install
```

- สร้าง `.env` ตามตัวอย่างด้านบน

- รันในโหมดพัฒนา (มี nodemon):

```bash
npm run dev
```

เมื่อรันจะเห็นข้อความว่า `Backend running on http://localhost:5000` (ถ้า MONGO_URI ถูกตั้งค่าและเชื่อมสำเร็จจะแสดง `MongoDB connected`)

2) Frontend

- เปิดเทอร์มินัลอีกอันแล้วเข้าโฟลเดอร์ frontend:

```bash
cd frontend
npm install
npm run dev
```

- Next.js จะรันบน `http://localhost:3000` โดยค่าเริ่มต้น

3) ส่วนบริการ AI (Ollama)

- โค้ด backend ส่งคำขอไปที่ `http://localhost:11434/api/chat` ตามตัวอย่าง ถ้าคุณใช้ Ollama ให้แน่ใจว่ารันอยู่และ model (`llama3`) พร้อมใช้งาน
- ถ้าใช้บริการ AI อื่น ให้แก้ URL และ payload ใน `backend/src/routes/chat.js` ให้สอดคล้อง

## API (ที่มีอยู่)
- GET /api/chat
  - คำอธิบาย: ดึงประวัติข้อความทั้งหมดจาก MongoDB
  - ผลลัพธ์: list ของ message objects

- POST /api/chat
  - คำอธิบาย: ส่งข้อความใหม่จากผู้ใช้
  - body: { message: string }
  - พฤติกรรม: บันทึกข้อความผู้ใช้ => เรียก AI => บันทึกข้อความ AI => return ทั้งคู่

หมายเหตุ: frontend เรียก `DELETE /api/chat` เพื่อ clear chat แต่ `backend/src/routes/chat.js` ที่มีอยู่ตอนนี้ยังไม่มีการ implement route สำหรับ DELETE — ถ้าต้องการให้ล้างข้อมูลจริง ๆ จาก DB ให้เพิ่ม route DELETE ใน backend เช่น:

```js
// ตัวอย่าง (เพื่อความเข้าใจ)
router.delete('/', async (req, res) => {
  try {
    await Message.deleteMany({});
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear messages' });
  }
});
```

หรือถ้าต้องการให้ปุ่ม Clear chat ทำงานเฉพาะฝั่ง client โดยไม่ลบ DB ให้ลบการเรียก DELETE ใน frontend

## ข้อควรระวัง / Troubleshooting
- ถ้า backend แสดง error เกี่ยวกับ MongoDB: ตรวจสอบ `MONGO_URI`, ว่า MongoDB รันอยู่ และ network ขาออกถูกต้อง
- ถ้าได้รับ `AI not responding` หรือ timeout: ตรวจสอบว่า Ollama (หรือบริการ AI) รันบนพอร์ตที่คอนฟิกไว้ และ API path/payload ถูกต้อง
- ถ้า frontend ไม่โหลดข้อความ: ตรวจสอบ CORS (backend ใช้ `cors()` แล้วโดยค่าเริ่มต้นอนุญาตทั้งหมด) และตรวจสอบ endpoint URL

## ข้อเสนอแนะพัฒนา (Next steps)
- เพิ่ม route `DELETE /api/chat` หากต้องการให้ Clear chat ล้างข้อมูลจริงจาก DB
- เพิ่ม validation และ rate-limiting เพื่อป้องกันการโจมตีหรือการใช้งานเกิน
- ย้ายการเรียกบริการ AI เข้าไปใน `services/ollama.js` ให้แยก concerns
- เพิ่ม unit tests / integration tests สำหรับ API
- ทำให้การตั้งค่า AI (URL, model) เป็นค่าใน `.env` แทนการ hardcode

## สรุปการรันแบบย่อ (Quick start)
- Backend:
  - cd backend
  - npm install
  - สร้าง .env แล้วตั้ง MONGO_URI
  - npm run dev

- Frontend:
  - cd frontend
  - npm install
  - npm run dev

เปิด http://localhost:3000 และลองส่งข้อความ

---
