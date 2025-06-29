import React, { useState } from "react";
import {
  LiveProvider,
  LiveEditor,
  LiveError,
  LivePreview,
} from "react-live";


const sanitizeJSX = (response) => {
  if (!response || typeof response !== "string") {
    return `
      const ErrorComponent = () => (
        <div className="text-red-500 p-4 bg-white rounded shadow">
          ❌ Invalid GPT response
        </div>
      );
      render(<ErrorComponent />);
    `;
  }

  // Remove markdown formatting and trim
  const cleaned = response.replace(/```jsx|```/g, "").trim();

  const invalid =
    cleaned.includes("export") ||
    cleaned.includes("import") ||
    cleaned.includes("require");

  if (invalid) {
    return `
      const ErrorComponent = () => (
        <div className="text-red-500 p-4 bg-white rounded shadow">
          ❌ GPT output contains unsupported syntax (export/import/require)
        </div>
      );
      render(<ErrorComponent />);
    `;
  }

  const alreadyIncludesRender = cleaned.includes("render(");
  const usesHooks = /React\.use(State|Effect)/.test(cleaned) || /use(State|Effect)/.test(cleaned);

  const isWrappedComponent =
    cleaned.startsWith("() =>") ||
    cleaned.startsWith("(props) =>") ||
    cleaned.startsWith("function");

  const jsxBlock = isWrappedComponent
  ? `const Component = ${cleaned};`
  : `const Component = () => (${cleaned});`;

return `
  ${jsxBlock}
  render(<Component />);
`;


};



const App = () => {
  const [prompt, setPrompt] = useState("");
  const [code, setCode] = useState("");
  const [rawCode, setRawCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setCopied(false);
    try {
      const response = await fetch("http://localhost:8080/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const result = await response.text();
      const cleanedCode = sanitizeJSX(result);
      setRawCode(result.trim());
      setCode(cleanedCode);
    } catch (error) {
      console.error("Error generating component:", error);
      setCode(`
        const ErrorComponent = () => (
          <div className="text-red-500 p-4 bg-white rounded shadow">
            ⚠️ Failed to generate component
          </div>
        );
        render(<ErrorComponent />);
      `);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        🧠 AI React Component Generator
      </h1>

      <div className="mb-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Create a login form with username, password, and toggle between sign in/sign up"
          className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring focus:border-blue-400"
          rows={4}
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
          {rawCode && (
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
            >
              {copied ? "Copied!" : "Copy JSX"}
            </button>
          )}
        </div>
      </div>

      {code && (
        <LiveProvider
          key={code} // ✅ force re-render
          code={code}
          noInline
          scope={{
            React
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="font-semibold mb-2 text-gray-700">JSX Code</h2>
              <LiveEditor className="border rounded p-2 text-sm bg-white h-96 overflow-auto" />
              <LiveError className="text-red-600 mt-2 text-sm" />
            </div>
            <div>
              <h2 className="font-semibold mb-2 text-gray-700">Live Preview</h2>
              <LivePreview className="p-4 bg-white rounded border min-h-96" />
            </div>
          </div>
        </LiveProvider>
      )}
    </div>
  );
};

export default App;
