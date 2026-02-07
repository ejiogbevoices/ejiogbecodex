/**
 * Fenix Voice Assistant — Suggestion Engine & Intent Detection
 *
 * All suggestions are culture-neutral and tradition-agnostic.
 * The agent discovers the user's language and tradition through conversation.
 * Intent detection runs internally to route system prompts and RAG table selection.
 * The user never sees modes, labels, or tabs.
 */

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type FenixIntent =
  | "navigate"
  | "tutor"
  | "storyteller"
  | "wellness"
  | "divination"
  | "researcher"
  | "general";

export type UserLearningProfile = {
  targetLanguages: string[];
  proficiencyLevels: Record<string, string>;
  interests: string[];
  streakCount: number;
  totalXp: number;
  lastSessionTopics: string[];
};

// ─────────────────────────────────────────────
// Suggestions (all culture-neutral)
// ─────────────────────────────────────────────

const SUGGESTION_POOL = {
  discovery: [
    "Show me recent recordings",
    "What languages are in the archive?",
    "Browse traditions and communities",
    "Find something to listen to",
    "What's new in the archive?",
    "Explore ceremonies and rituals",
    "Show me the manuscripts",
    "What instruments are documented?",
  ],
  language: [
    "Teach me a greeting",
    "Help me with pronunciation",
    "Quiz me on vocabulary",
    "Explain a proverb",
    "Practice conversational phrases",
    "Explain basic grammar rules",
    "What words did I learn recently?",
  ],
  cultural: [
    "Tell me an origin story",
    "Share a folktale about wisdom",
    "What creation stories are in the archive?",
    "Describe a traditional ceremony",
    "Tell me about a sacred symbol",
    "Share a myth from the archive",
  ],
  wellness: [
    "Guide me through a breathing exercise",
    "Show me somatic movements",
    "What healing plants are in the archive?",
    "Teach me a grounding practice",
    "What are traditional healing methods?",
    "Guide me in meditation",
  ],
  divination: [
    "Explain a divination system",
    "What divination tools exist?",
    "Tell me about sacred symbols",
    "How do different traditions interpret signs?",
    "What calendars are in the archive?",
  ],
  research: [
    "Search manuscripts about healing",
    "Find recordings in a specific language",
    "What artifacts are in the collection?",
    "Show me documents about ceremonies",
    "Find historical artifacts",
    "What communities are represented?",
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Pick 6 suggestions, one from each category.
 * If the user has a learning profile, weight toward their interests.
 */
export function pickSuggestions(
  profile?: UserLearningProfile | null,
): string[] {
  const categories = Object.values(SUGGESTION_POOL);

  if (!profile) {
    return categories.map((cat) => pickRandom(cat));
  }

  // With a profile, pick more from areas matching their interests
  const results: string[] = [];
  const interests = profile.interests.map((i) => i.toLowerCase());

  // Always include one discovery suggestion
  results.push(pickRandom(SUGGESTION_POOL.discovery));

  // If they have target languages, include language suggestions
  if (profile.targetLanguages.length > 0) {
    results.push(pickRandom(SUGGESTION_POOL.language));
  }

  // Match interest keywords to categories
  const categoryKeywords: Record<string, string[]> = {
    cultural: ["stories", "myths", "ceremonies", "traditions", "history"],
    wellness: [
      "wellness",
      "healing",
      "meditation",
      "somatic",
      "plants",
      "herbal",
    ],
    divination: ["divination", "symbols", "oracle", "reading", "signs"],
    research: [
      "manuscripts",
      "artifacts",
      "research",
      "academic",
      "documents",
    ],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (interests.some((i) => keywords.some((k) => i.includes(k)))) {
      results.push(
        pickRandom(
          SUGGESTION_POOL[category as keyof typeof SUGGESTION_POOL],
        ),
      );
    }
  }

  // Fill remaining slots from random categories
  while (results.length < 6) {
    const cat = pickRandom(categories);
    const suggestion = pickRandom(cat);
    if (!results.includes(suggestion)) {
      results.push(suggestion);
    }
  }

  return results.slice(0, 6);
}

// ─────────────────────────────────────────────
// Intent Detection
// ─────────────────────────────────────────────

/**
 * Detect user intent from their message.
 * Used internally to:
 *  1. Select the right system prompt layer
 *  2. Choose which RAG tables to search
 *  3. Adjust maxOutputTokens (wellness guided sessions need more)
 *
 * The user never sees this classification.
 */
export function detectIntent(message: string): FenixIntent {
  const m = message.toLowerCase().trim();

  // Navigation: explicit requests to go somewhere
  if (/^(show me|go to|take me to|open|browse|navigate to)\b/.test(m)) {
    return "navigate";
  }

  // Language tutoring
  if (
    /\b(teach|learn|greeting|vocabulary|grammar|phrase|pronounc|tone|syllable|conjugat|translate|flashcard|quiz me|test me|review|practice)\b/.test(
      m,
    )
  ) {
    return "tutor";
  }

  // Storytelling
  if (
    /\b(story|myth|legend|folktale|tale|creation|origin|narrative|fable|parable)\b/.test(
      m,
    )
  ) {
    return "storyteller";
  }

  // Wellness
  if (
    /\b(breath|meditat|ground|healing|wellness|somatic|movement|herbal|plant|exercise|guided|relaxa|calm)\b/.test(
      m,
    )
  ) {
    return "wellness";
  }

  // Divination
  if (
    /\b(divin|oracle|odu|sign|interpret|symbol|reading|cast|omen|augur|calendar)\b/.test(
      m,
    )
  ) {
    return "divination";
  }

  // Research / archive search
  if (
    /\b(search|manuscript|artifact|document|find.*record|research|collection|archive|catalog)\b/.test(
      m,
    )
  ) {
    return "researcher";
  }

  return "general";
}

// ─────────────────────────────────────────────
// RAG Table Selection per Intent
// ─────────────────────────────────────────────

export const INTENT_RAG_TABLES: Record<FenixIntent, string[]> = {
  navigate: [
    "recordings",
    "manuscripts",
    "traditions",
    "communities",
    "ceremonies",
    "myth_entities",
  ],
  tutor: [
    "dictionary_words",
    "glossary_terms",
    "proverb_entries",
    "transcript_segments",
    "recordings",
  ],
  storyteller: [
    "myth_entities",
    "ceremonies",
    "traditions",
    "proverb_entries",
    "recordings",
    "manuscripts",
  ],
  wellness: [
    "somatic_movements",
    "ceremonies",
    "plants",
    "foods",
    "food_recipes",
    "herbal_systems",
    "instruments",
  ],
  divination: [
    "divination_systems",
    "divination_units",
    "divination_tools",
    "symbols",
    "calendars",
    "myth_entities",
  ],
  researcher: [
    "manuscripts",
    "recordings",
    "artifacts",
    "instruments",
    "communities",
    "traditions",
    "ceremonies",
    "myth_entities",
    "symbols",
    "plants",
  ],
  general: [
    "recordings",
    "manuscripts",
    "myth_entities",
    "glossary_terms",
    "traditions",
    "communities",
  ],
};
