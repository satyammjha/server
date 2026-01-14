import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API });

async function callGroq(fullPrompt: string) {
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: fullPrompt }],
            model: "llama-3.3-70b-versatile",

            response_format: { type: "json_object" }
        });

        let rawOutput = completion.choices[0].message.content || "";

        rawOutput = rawOutput.replace(/```json/g, "").replace(/```/g, "").trim();

        const jsonResponse = JSON.parse(rawOutput);
        return jsonResponse;

    } catch (e) {
        console.error("AI Generation Error:", e);
        return null;
    }
}

export default callGroq;