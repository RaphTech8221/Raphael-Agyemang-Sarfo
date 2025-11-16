
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateReportCardComment = async (
  studentName: string,
  strengths: string,
  areasForImprovement: string
): Promise<string> => {
  const prompt = `
    You are an experienced and caring educator. Your task is to write a thoughtful and constructive report card comment for a student.

    Student's Name: ${studentName}

    Positive qualities and strengths:
    ${strengths}

    Areas for improvement:
    ${areasForImprovement}

    Based on the information above, please generate a professional, encouraging, and balanced report card comment. The tone should be positive, even when addressing areas for improvement. Frame the challenges as opportunities for growth. Do not use bullet points; write it as a single, cohesive paragraph of about 4-6 sentences. Start the comment by addressing the student by name.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating comment from Gemini API:", error);
    throw new Error("Failed to communicate with the Gemini API.");
  }
};

export const generateLessonPlan = async (
  subject: string,
  gradeLevel: string,
  topic: string,
  duration: string,
  objectives: string
): Promise<string> => {
  const prompt = `
    You are an expert curriculum designer for K-12 education. Your task is to generate a comprehensive and engaging lesson plan based on the following details.
    The output should be well-structured, clear, and practical for a classroom setting.
    Please format the output as a single block of text, using headers like '## Learning Objectives', '## Materials Needed', '## Lesson Procedure', and '## Assessment'.
    Under '## Lesson Procedure', include sub-sections for 'Introduction', 'Main Activity', and 'Conclusion', allocating time appropriately based on the total duration provided.

    ---

    **Subject:** ${subject}
    **Grade Level:** ${gradeLevel}
    **Topic:** ${topic}
    **Lesson Duration:** ${duration} minutes
    **Key Objectives:**
    ${objectives}

    ---

    Now, generate the lesson plan.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating lesson plan from Gemini API:", error);
    throw new Error("Failed to communicate with the Gemini API.");
  }
};