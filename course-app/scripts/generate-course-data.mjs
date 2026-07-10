import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mdPath = path.resolve(__dirname, "../../AI Agent Memory Course.md");
const outPath = path.resolve(__dirname, "../lib/course/modules.json");

const LEVELS = {
  0: "Foundation",
  1: "Foundation",
  2: "Core",
  3: "Core",
  4: "Core",
  5: "Intermediate",
  6: "Intermediate",
  7: "Intermediate",
  8: "Advanced",
  9: "Advanced",
  10: "Advanced",
  11: "Research",
  12: "Capstone",
  13: "Capstone",
};

const DIAGRAMS = {
  0: "setup",
  1: "context-window",
  2: "vector-search",
  3: "rag-pipeline",
  4: "memory-types",
  5: "memory-ops",
  6: "knowledge-graph",
  7: "hybrid-retrieval",
  8: "mcp-integration",
  9: "production-systems",
  10: "unsolved-problems",
  11: "research-papers",
  12: "capstone",
  13: "production-patterns",
};

const TITLES = {
  0: "Setup",
  1: "Why Memory Is a Problem",
  2: "Embeddings & Vector Search",
  3: "RAG (Retrieval Augmented Generation)",
  4: "Agent Memory Fundamentals",
  5: "Memory Operations & Fact Extraction",
  6: "Knowledge Graphs for Memory",
  7: "Hybrid Retrieval",
  8: "Protocols & Integration",
  9: "Studying Production Systems",
  10: "Advanced & Unsolved Problems",
  11: "Research Paper Deep Dive",
  12: "CAPSTONE: End-to-End Memory System",
  13: "Production Patterns & Integration",
};

/** Reframe product/business language as neutral agentic-memory course content */
function sanitizeCourseText(text) {
  return text
    .replace(/Vertical Memory-as-a-Service Product/gi, "Agent Memory Systems")
    .replace(/Memory-as-a-Service/gi, "agent memory")
    .replace(/vertical memory product/gi, "complete agent memory system")
    .replace(/Vertical Memory Product/gi, "Complete Agent Memory System")
    .replace(/your vertical/gi, "your agent use case")
    .replace(/chosen vertical/gi, "chosen use case")
    .replace(/specific vertical/gi, "specific use case")
    .replace(/for your vertical/gi, "for your use case")
    .replace(/product IP/gi, "design documentation")
    .replace(/design-partner customer/gi, "technical reviewer")
    .replace(/first customer/gi, "a peer reviewer")
    .replace(/sales argument/gi, "technical argument")
    .replace(/pricing page/gi, "architecture summary")
    .replace(/positioning statement/gi, "system summary")
    .replace(/Business Layer/gi, "Production Patterns")
    .replace(/vertical-tuned MVP/gi, "end-to-end memory system")
    .replace(/vertical-tuned/gi, "use-case-tuned")
    .replace(/Build Your Vertical Memory Product \(MVP\)/gi, "Build a Complete Agent Memory System")
    .replace(/Build Your Vertical Memory Product/gi, "Build a Complete Agent Memory System")
    .replace(/or the vertical\?/gi, "or the routing design?")
    .replace(/your own product/gi, "your own memory system")
    .replace(/building your product/gi, "building memory systems")
    .replace(/SDK design priorities for your own product/gi, "SDK design priorities for memory tools")
    .replace(/### Pricing models, compared/gi, "### Cost models for memory operations")
    .replace(/Developer experience as a genuine competitive moat/gi, "Developer experience in memory APIs")
    .replace(/Positioning against generalist players/gi, "Choosing the right memory approach")
    .replace(/pricing statement/gi, "architecture summary")
    .replace(/sanity-checked pricing/gi, "reviewed system tradeoffs");
}

const COMPLETION_CHECKLIST = [
  "Module 1: Watched an LLM forget, measured token cost growth firsthand",
  "Module 2: Built working embedding comparisons and a local vector store",
  "Module 3: Built full manual RAG pipeline with re-ranking",
  "Module 4: Classified real conversation facts into three memory types",
  "Module 5: Built working fact extraction + ADD/UPDATE/DELETE/NOOP routing",
  "Module 6: Built entity/relationship extraction into a working graph",
  "Module 7: Built hybrid (semantic + BM25) retrieval with fusion",
  "Module 8: Built a working MCP server with multi-tenancy",
  "Module 9: Hands-on tested Mem0 and Cognee on the same contradiction scenario",
  "Module 10: Implemented novelty gating, wrote a staleness policy",
  "Module 11: Summarized 4 core papers, built your evaluation mini-benchmark",
  "Module 12: Built a complete end-to-end agent memory system with measured accuracy",
  "Module 13: Understand production APIs, integration patterns, and system design tradeoffs",
];

const content = fs.readFileSync(mdPath, "utf8");

const completionMatch = content.match(
  /# Course Completion Checklist\n([\s\S]*)$/
);
const mainContent = content.replace(/# Course Completion Checklist[\s\S]*$/, "");

const parts = mainContent.split(/^# MODULE (\d+) — /m).slice(1);

const modules = [];
for (let i = 0; i < parts.length; i += 2) {
  const id = parseInt(parts[i], 10);
  const body = parts[i + 1];
  const titleLine = body.split("\n")[0].trim();
  const rest = body.slice(body.indexOf("\n") + 1).trim();

  const checkpoints = [];

  const capstoneMatch = rest.match(
    /### Checkpoint — capstone completion criteria\n([\s\S]*?)(?=\n# |\n---\n|$)/
  );
  if (capstoneMatch) {
    const items = [...capstoneMatch[1].matchAll(/^- \[ \] (.+)$/gm)];
    items.forEach((m) => checkpoints.push(sanitizeCourseText(m[1])));
  }

  const questionsMatch = rest.match(
    /### Checkpoint questions[^\n]*\n([\s\S]*?)(?=\n---\n|\n# |$)/
  );
  if (questionsMatch) {
    const items = [...questionsMatch[1].matchAll(/^- (.+)$/gm)];
    items.forEach((m) => checkpoints.push(sanitizeCourseText(m[1].trim())));
  }

  if (id === 0 && checkpoints.length === 0) {
    checkpoints.push(
      "Can call an LLM API and print a response",
      "Can install and import chromadb without errors"
    );
  }

  let lessonContent = rest
    .replace(/### Checkpoint questions[^\n]*\n[\s\S]*?(?=\n---|\n# |$)/, "")
    .replace(
      /### Checkpoint — capstone completion criteria\n[\s\S]*?(?=\n# |\n---\n|$)/,
      ""
    )
    .trim();

  lessonContent = sanitizeCourseText(lessonContent);

  modules.push({
    id,
    title: TITLES[id] || sanitizeCourseText(titleLine),
    level: LEVELS[id] || "Core",
    diagram: DIAGRAMS[id] || "learning-path",
    description: sanitizeCourseText(
      lessonContent.split("\n\n")[0]?.replace(/^#+ /, "").slice(0, 200) || ""
    ),
    content: lessonContent,
    checkpoints: checkpoints.map(sanitizeCourseText),
  });
}

const output = {
  completionChecklist: COMPLETION_CHECKLIST,
  modules,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
console.log(`Generated ${modules.length} modules, ${COMPLETION_CHECKLIST.length} completion items`);
