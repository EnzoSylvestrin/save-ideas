import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createProject = mutation({
  args: {
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      title: args.title,
      createdAt: now,
      updatedAt: now,
    });
    return projectId;
  },
});

export const listProjects = query({
  handler: async (ctx) => {
    const projects = await ctx.db
      .query("projects")
      .order("desc")
      .collect();
    return projects;
  },
});

export const getProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    return project;
  },
});

