import { Buffer } from "buffer";
import { v } from "convex/values";
import OpenAI from "openai";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const listIdeasByProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
    return ideas;
  },
});

export const getIdea = query({
  args: {
    ideaId: v.id("ideas"),
  },
  handler: async (ctx, args) => {
    const idea = await ctx.db.get(args.ideaId);
    return idea;
  },
});

export const createIdea = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    audioUrl: v.optional(v.string()),
    transcribedText: v.optional(v.string()),
    processedIdea: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const ideaId = await ctx.db.insert("ideas", {
      projectId: args.projectId,
      title: args.title,
      audioUrl: args.audioUrl,
      transcribedText: args.transcribedText,
      processedIdea: args.processedIdea,
      createdAt: now,
    });
    return ideaId;
  },
});

export const processAudioIdea = action({
  args: {
    projectId: v.id("projects"),
    audioBase64: v.string(),
    audioMimeType: v.string(),
  },
  handler: async (ctx, args): Promise<{
    ideaId: string;
    title: string;
    transcribedText: string;
    processedIdea: string;
  }> => {
    try {
      const audioBuffer = Buffer.from(args.audioBase64, "base64");
      const audioFile = new File([audioBuffer.buffer], "audio.m4a", {
        type: args.audioMimeType,
      });

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
      });

      const transcribedText = transcription.text;

      // Generate title from transcription
      const titleCompletion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente que cria títulos concisos e descritivos. Crie um título curto (máximo 60 caracteres) que resuma a ideia principal do texto transcrito.",
          },
          {
            role: "user",
            content: `Crie um título curto para esta ideia: ${transcribedText}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 30,
      });

      const title = titleCompletion.choices[0]?.message?.content?.trim() || transcribedText.substring(0, 60);

      // Generate structured idea
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente que ajuda a estruturar ideias de projetos. Analise o texto transcrito e gere uma ideia estruturada e clara em formato markdown, com seções como: ## Objetivo, ## Pontos Principais, ## Implementação, etc. Use formatação markdown para destacar títulos e listas.",
          },
          {
            role: "user",
            content: `Processe e estruture a seguinte ideia em formato markdown: ${transcribedText}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      });

      const processedIdea = completion.choices[0]?.message?.content || "";

      const ideaId: string = await ctx.runMutation(api.ideas.createIdea, {
        projectId: args.projectId,
        title: title,
        transcribedText: transcribedText,
        processedIdea: processedIdea,
      });

      return {
        ideaId,
        title,
        transcribedText,
        processedIdea,
      };
    } catch (error) {
      console.error("Error processing audio idea:", error);
      throw new Error("Failed to process audio idea");
    }
  },
});

