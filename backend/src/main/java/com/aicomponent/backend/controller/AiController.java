package com.aicomponent.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class AiController {

    @Value("${openai.api.key}")
    private String openAiApiKey;

    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    @PostMapping("/generate")
    public ResponseEntity<String> generateComponent(@RequestBody Map<String, String> body) {
            System.out.println("Received prompt: " + body.get("prompt"));  // Add this line

            String userPrompt = body.get("prompt");

        Map<String, Object> systemMessage = Map.of(
                "role", "system",
                "content", """
You are a senior frontend engineer.

When given a user prompt, generate a valid anonymous React component using JSX syntax and Tailwind CSS for styling.

✅ Requirements:
- Return ONLY a single anonymous arrow function like: () => (...) or () => { return (...) }
- Use React.useState or React.useEffect when interactivity is needed (e.g., toggling, form inputs, dynamic behavior)
- Do NOT include: import, export, const, function, require, or markdown backticks (```jsx)
- The output must be valid JSX and ready to render inside: render(<Component />)
- Use Tailwind CSS for styling
- If an image is needed, use https://placehold.co/400x300
- NEVER return any explanation, comments, or markdown — just the JSX arrow function

🧠 Example output:
() => {
  const [clicked, setClicked] = React.useState(false);
  return (
    <button onClick={() => setClicked(!clicked)} className="p-2 bg-blue-500 text-white">
      {clicked ? 'Clicked!' : 'Click Me'}
    </button>
  );
}
"""
        );

        Map<String, Object> userMessage = Map.of(
                "role", "user",
                "content", userPrompt
        );

        Map<String, Object> requestBody = Map.of(
                "model", "gpt-3.5-turbo",
                "messages", List.of(systemMessage, userMessage)
        );

        try {
            // Convert Java Map to JSON
            String json = mapper.writeValueAsString(requestBody);

            // Prepare request
            Request request = new Request.Builder()
                    .url("https://api.openai.com/v1/chat/completions")
                    .header("Authorization", "Bearer " + openAiApiKey)
                    .header("Content-Type", "application/json")
                    .post(okhttp3.RequestBody.create(json, MediaType.parse("application/json")))
                    .build();

            // Execute request
            try (Response response = client.newCall(request).execute()) {
                if (response.isSuccessful()) {
                    String responseBody = Objects.requireNonNull(response.body()).string();
                    // Extract GPT response (dirty way)
                    String content = mapper.readTree(responseBody)
                            .get("choices").get(0)
                            .get("message").get("content").asText();

                    return ResponseEntity.ok(content);
                } else {
                    return ResponseEntity.status(response.code())
                            .body("OpenAI error: " + Objects.requireNonNull(response.body()).string());
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}
