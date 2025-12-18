
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    crop: { type: Type.STRING, description: "Name of the crop identified" },
    disease: { type: Type.STRING, description: "Name of the disease detected, or 'Healthy' if none" },
    confidence: { type: Type.NUMBER, description: "Confidence score between 0 and 1" },
    isPlant: { type: Type.BOOLEAN, description: "Whether the image contains a plant" },
    description: { type: Type.STRING, description: "A brief summary of the condition" },
    symptoms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of visual symptoms" },
    recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Step-by-step treatment or prevention actions" },
    severity: { type: Type.STRING, description: "Severity level: Low, Moderate, High, Critical" }
  },
  required: ["crop", "disease", "confidence", "isPlant", "description", "symptoms", "recommendations", "severity"]
};

export const analyzeCropImage = async (base64Image: string): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";
  
  const prompt = `Act as an expert Plant Pathologist and Agronomist. 
    Analyze the provided image of a crop.
    1. Determine if the image contains a plant.
    2. Identify the crop species.
    3. Detect any diseases, pests, or nutrient deficiencies.
    4. Provide detailed symptoms and organic/chemical treatment recommendations.
    5. Be precise and scientific. If the plant is healthy, state it clearly.
    6. If the image is not a plant, set isPlant to false.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1]
          }
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI service");
  
  return JSON.parse(text) as AnalysisResult;
};

export const getSearchBasedTreatments = async (crop: string, disease: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Provide a comprehensive treatment protocol for ${disease} affecting ${crop}. 
    Include:
    1. Specific organic treatments (e.g., Neem oil, specific bacteria).
    2. Recommended chemical fungicides/pesticides if applicable.
    3. Cultural practices to prevent recurrence.
    4. Citing reliable agricultural extension sources.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};
