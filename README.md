# 🧠 AI React Component Generator

This project allows users to generate interactive, styled React components using AI (via OpenAI API). The app includes a Spring Boot backend and a React frontend using `react-live` for real-time JSX previews.

---

## 📁 Project Structure

```
ai-component-generator/
├── backend/       # Spring Boot backend
│   └── src/
│       └── main/
│           └── java/
│               └── com/aicomponent/backend/controller/AiController.java
├── frontend/      # React frontend with react-live
│   └── src/
│       └── App.jsx
├── README.md
```

---

## ⚙️ Setup Instructions

### 1. Backend (Spring Boot)

#### 🔧 Requirements:
- Java 17+
- Maven

#### ▶️ Run Backend:

```bash
cd backend
./mvnw spring-boot:run
```

#### 🗝️ Configure OpenAI API Key:

Edit `application.properties`:

```properties
openai.api.key=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> You can also set this as an environment variable.

---

### 2. Frontend (React + Vite)

#### 🔧 Requirements:
- Node.js 16+
- npm or yarn

#### ▶️ Run Frontend:

```bash
cd frontend
npm install
npm run dev
```

> The app runs at `http://localhost:5173`

---

## ✨ Features

- Prompt-driven JSX component generation
- Tailwind CSS styling
- Real-time editing and preview with `react-live`
- Syntax-safe sandbox
- Clipboard support for copying JSX

---

## 💬 Example Prompts

- `Create a login form with email and password inputs and toggle between sign in/sign up`
- `Generate a product card with image, title, description, and Add to Cart button`
- `Build a contact form with validation and a submit button`

---

## 🛡️ Restrictions

To ensure safe rendering, the AI output is validated to disallow:

- `import`, `export`, `require`
- Global functions or side effects
- Markdown formatting like \`\`\`jsx

Only valid arrow function JSX like this is accepted:

```js
() => (
  <div className="p-4">Hello, World!</div>
)
```

---

## 📦 Dependencies

### Frontend:
- React
- Tailwind CSS
- react-live

### Backend:
- Spring Boot (Web)
- OkHttp (HTTP client)
- Jackson (JSON handling)

---

## 📜 License

MIT License.
