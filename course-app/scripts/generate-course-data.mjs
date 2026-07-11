import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

function findMarkdownPath(candidates) {
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`Markdown file not found. Tried: ${candidates.join(", ")}`);
}

function writeJson(relativeOut, data) {
  const outPath = path.resolve(__dirname, "..", relativeOut);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`  → ${relativeOut} (${data.modules.length} modules)`);
}

// ─── Agentic Memory Course ───────────────────────────────────────────────────

function sanitizeAgenticText(text) {
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

const AGENTIC_LEVELS = {
  0: "Foundation", 1: "Foundation", 2: "Core", 3: "Core", 4: "Core",
  5: "Intermediate", 6: "Intermediate", 7: "Intermediate",
  8: "Advanced", 9: "Advanced", 10: "Advanced",
  11: "Research", 12: "Capstone", 13: "Capstone",
};

const AGENTIC_DIAGRAMS = {
  0: "setup", 1: "context-window", 2: "vector-search", 3: "rag-pipeline",
  4: "memory-types", 5: "memory-ops", 6: "knowledge-graph", 7: "hybrid-retrieval",
  8: "mcp-integration", 9: "production-systems", 10: "unsolved-problems",
  11: "research-papers", 12: "capstone", 13: "production-patterns",
};

const AGENTIC_TITLES = {
  0: "Setup", 1: "Why Memory Is a Problem", 2: "Embeddings & Vector Search",
  3: "RAG (Retrieval Augmented Generation)", 4: "Agent Memory Fundamentals",
  5: "Memory Operations & Fact Extraction", 6: "Knowledge Graphs for Memory",
  7: "Hybrid Retrieval", 8: "Protocols & Integration",
  9: "Studying Production Systems", 10: "Advanced & Unsolved Problems",
  11: "Research Paper Deep Dive", 12: "CAPSTONE: End-to-End Memory System",
  13: "Production Patterns & Integration",
};

const AGENTIC_COMPLETION = [
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

function generateAgenticMemory() {
  const mdPath = findMarkdownPath([
    path.join(repoRoot, "AI Agent Memory Course.md"),
    path.resolve(process.cwd(), "../AI Agent Memory Course.md"),
  ]);
  const content = fs.readFileSync(mdPath, "utf8");
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
      [...capstoneMatch[1].matchAll(/^- \[ \] (.+)$/gm)].forEach((m) =>
        checkpoints.push(sanitizeAgenticText(m[1]))
      );
    }

    const questionsMatch = rest.match(
      /### Checkpoint questions[^\n]*\n([\s\S]*?)(?=\n---\n|\n# |$)/
    );
    if (questionsMatch) {
      [...questionsMatch[1].matchAll(/^- (.+)$/gm)].forEach((m) =>
        checkpoints.push(sanitizeAgenticText(m[1].trim()))
      );
    }

    if (id === 0 && checkpoints.length === 0) {
      checkpoints.push(
        "Can call an LLM API and print a response",
        "Can install and import chromadb without errors"
      );
    }

    let lessonContent = rest
      .replace(/### Checkpoint questions[^\n]*\n[\s\S]*?(?=\n---|\n# |$)/, "")
      .replace(/### Checkpoint — capstone completion criteria\n[\s\S]*?(?=\n# |\n---\n|$)/, "")
      .trim();
    lessonContent = sanitizeAgenticText(lessonContent);

    modules.push({
      id,
      title: AGENTIC_TITLES[id] || sanitizeAgenticText(titleLine),
      level: AGENTIC_LEVELS[id] || "Core",
      diagram: AGENTIC_DIAGRAMS[id] || "learning-path",
      description: sanitizeAgenticText(
        lessonContent.split("\n\n")[0]?.replace(/^#+ /, "").slice(0, 200) || ""
      ),
      content: lessonContent,
      checkpoints: checkpoints.map(sanitizeAgenticText),
    });
  }

  writeJson("lib/course/agentic-memory/modules.json", {
    completionChecklist: AGENTIC_COMPLETION,
    modules,
  });
}

// ─── Backend & Distributed Systems Course ───────────────────────────────────

const BACKEND_LEVELS = {
  1: "Foundation", 2: "Foundation", 3: "Foundation", 4: "Foundation",
  5: "Core", 6: "Core",
  7: "Intermediate", 8: "Intermediate", 9: "Intermediate", 10: "Intermediate",
  11: "Advanced", 12: "Advanced", 13: "Advanced", 14: "Advanced",
  15: "Capstone", 16: "Capstone",
};

const BACKEND_DIAGRAMS = {
  1: "learning-path", 2: "learning-path", 3: "learning-path", 4: "learning-path",
  5: "production-systems", 6: "production-systems", 7: "hybrid-retrieval",
  8: "hybrid-retrieval", 9: "setup", 10: "production-systems",
  11: "production-patterns", 12: "production-patterns", 13: "mcp-integration",
  14: "production-patterns", 15: "production-systems", 16: "knowledge-graph",
};

const BACKEND_TITLES = {
  1: "Networking",
  2: "Operating Systems",
  3: "Linux",
  4: "Databases",
  5: "System Design Basics",
  6: "Distributed Systems Concepts",
  7: "Messaging Systems",
  8: "Caching",
  9: "Containers",
  10: "Kubernetes",
  11: "Cloud (AWS)",
  12: "Observability",
  13: "API Design",
  14: "Security",
  15: "Architecture Patterns",
  16: "Algorithms in Distributed Systems",
};

const BACKEND_COMPLETION = [
  "Module 1: Traced a web request with curl and explained TCP vs UDP",
  "Module 2: Observed CPU/memory with top/htop under load",
  "Module 3: Practiced Linux debugging commands on a remote server",
  "Module 4: Compared query performance with and without a database index",
  "Module 5: Drew a URL shortener design and discussed CAP trade-offs",
  "Module 6: Built retry, timeout, and backoff into an API client script",
  "Module 7: Documented Kafka partition strategy and tested locally",
  "Module 8: Implemented cache-aside with Redis and measured speedup",
  "Module 9: Built and ran a multi-container Docker app",
  "Module 10: Deployed to Kubernetes and watched auto-healing + HPA",
  "Module 11: Launched EC2, uploaded to S3, and cleaned up resources",
  "Module 12: Built a Prometheus + Grafana dashboard panel",
  "Module 13: Built a REST API with JWT auth and rate limiting",
  "Module 14: Moved secrets to env vars and practiced least-privilege IAM",
  "Module 15: Sketched a monolith-to-microservices split for one feature",
  "Module 16: Drew a consistent hashing ring and mapped keys to servers",
];

function extractSimpleExplanation(body) {
  const match = body.match(/### Simple explanation\n([\s\S]*?)(?=\n###|$)/);
  return match ? match[1].trim() : "";
}

function extractCheckpointsEasy(body, id, title) {
  const checkpoints = [];
  const simple = extractSimpleExplanation(body);
  if (simple) {
    checkpoints.push(`Can explain ${title} in my own words`);
  }

  const handsOn = body.match(/### 🛠️ Hands-on task[^\n]*\n([\s\S]*?)(?=\n---|\n##|$)/);
  if (handsOn) {
    const steps = [...handsOn[1].matchAll(/^\d+\.\s+(.+)$/gm)];
    steps.slice(0, 2).forEach((m) => {
      checkpoints.push(`Hands-on done: ${m[1].replace(/\*\*/g, "").slice(0, 100)}`);
    });
  }

  if (body.includes("### 🎥 Video")) {
    checkpoints.push("Watched at least one video tutorial for this module");
  }

  const diagramCount = (body.match(/```mermaid/g) ?? []).length;
  if (diagramCount > 0) {
    checkpoints.push(`Reviewed ${diagramCount} architecture diagram${diagramCount > 1 ? "s" : ""} in this module`);
  }

  if (checkpoints.length === 0) {
    checkpoints.push(`Completed all sections in Module ${id}: ${title}`);
  }

  return checkpoints.slice(0, 4);
}

function generateBackendDistributed() {
  const mdPath = findMarkdownPath([
    path.join(repoRoot, "Advanced Backend and Distributed System Design.md"),
    path.resolve(process.cwd(), "../Advanced Backend and Distributed System Design.md"),
  ]);
  const content = fs.readFileSync(mdPath, "utf8");

  const introEnd = content.indexOf("## Module 1:");
  const mainContent = introEnd > 0 ? content.slice(introEnd) : content;
  const footerStart = mainContent.search(/^## Suggested Study Order/m);
  const modulesContent =
    footerStart > 0 ? mainContent.slice(0, footerStart) : mainContent;

  const parts = modulesContent.split(/^## Module (\d+): /m).slice(1);
  const modules = [];

  for (let i = 0; i < parts.length; i += 2) {
    const id = parseInt(parts[i], 10);
    const body = parts[i + 1];
    const titleLine = body.split("\n")[0].trim().replace(/\s*⭐.*$/, "");
    const rest = body.slice(body.indexOf("\n") + 1).trim();
    const title = BACKEND_TITLES[id] || titleLine.split("—")[0].trim() || titleLine;
    const simple = extractSimpleExplanation(rest);
    const description = simple || title;

    modules.push({
      id,
      title: titleLine.includes("—") ? titleLine : title,
      level: BACKEND_LEVELS[id] || "Core",
      diagram: BACKEND_DIAGRAMS[id] || "learning-path",
      description,
      content: rest.trim(),
      checkpoints: extractCheckpointsEasy(rest, id, title),
    });
  }

  writeJson("lib/course/backend-distributed-systems/modules.json", {
    completionChecklist: BACKEND_COMPLETION,
    modules,
  });
}

console.log("Generating course data…");
generateAgenticMemory();
generateBackendDistributed();
console.log("Done.");
