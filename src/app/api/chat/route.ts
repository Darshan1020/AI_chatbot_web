import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Zod validation schema for the request body
const chatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").trim(),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "") {
      return NextResponse.json(
        { 
          error: "Gemini API key not configured",
          instructions: "Please add GEMINI_API_KEY to your .env.local file. Get your key from https://makersuite.google.com/app/apikey"
        },
        { status: 500 }
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validatedData = chatRequestSchema.parse(body);

    const { message, conversationHistory } = validatedData;

    // Build the conversation messages for Gemini
    const messages = [
      {
        role: "user",
        parts: [
          {
            text: message,
          },
        ],
      },
    ];

    // Add conversation history if present
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg) => {
        messages.unshift({
          role: msg.role,
          parts: [
            {
              text: msg.content,
            },
          ],
        });
      });
    }

    // Call Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Convert messages to the correct format
    const chat = model.startChat({
      history: conversationHistory?.map(msg => ({
        role: msg.role === "assistant" ? "model" : msg.role,
        parts: [{ text: msg.content }],
      })) || []
    });
    
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const assistantResponse = response.text() || "I apologize, but I cannot generate a response at the moment.";

    // Return the response
    return NextResponse.json({
      message: assistantResponse,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    // Handle Gemini API errors
    if (error instanceof Error && (error.message.includes("API key") || error.message.includes("credentials") || error.message.includes("403") || error.message.includes("unregistered callers"))) {
      return NextResponse.json(
        { 
          error: "Gemini API configuration error. Please set GEMINI_API_KEY environment variable.",
          instructions: "Get your API key from https://makersuite.google.com/app/apikey and add it to .env.local file"
        },
        { status: 500 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
