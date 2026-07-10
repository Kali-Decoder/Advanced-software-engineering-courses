const ARROW_DEFS = `
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
      <path d="M0,0 L8,3 L0,6 Z" fill="#1e3a5f"/>
    </marker>
  </defs>
`;

export const DIAGRAMS = {
  "learning-path": () => `
    <svg viewBox="0 0 840 200" class="diagram-svg" aria-label="Course learning path" overflow="hidden">
      ${ARROW_DEFS}
      <rect x="10" y="70" width="100" height="60" rx="6" class="diagram-box foundation"/>
      <text x="60" y="95" text-anchor="middle" class="diagram-label">Foundation</text>
      <text x="60" y="115" text-anchor="middle" class="diagram-sublabel">Mod 0–1</text>
      <line x1="110" y1="100" x2="140" y2="100" class="diagram-arrow" marker-end="url(#arrow)"/>
      <rect x="145" y="70" width="100" height="60" rx="6" class="diagram-box core"/>
      <text x="195" y="95" text-anchor="middle" class="diagram-label">Core</text>
      <text x="195" y="115" text-anchor="middle" class="diagram-sublabel">Mod 2–4</text>
      <line x1="245" y1="100" x2="275" y2="100" class="diagram-arrow" marker-end="url(#arrow)"/>
      <rect x="280" y="70" width="110" height="60" rx="6" class="diagram-box intermediate"/>
      <text x="335" y="95" text-anchor="middle" class="diagram-label">Intermediate</text>
      <text x="335" y="115" text-anchor="middle" class="diagram-sublabel">Mod 5–7</text>
      <line x1="390" y1="100" x2="420" y2="100" class="diagram-arrow" marker-end="url(#arrow)"/>
      <rect x="425" y="70" width="100" height="60" rx="6" class="diagram-box advanced"/>
      <text x="475" y="95" text-anchor="middle" class="diagram-label">Advanced</text>
      <text x="475" y="115" text-anchor="middle" class="diagram-sublabel">Mod 8–10</text>
      <line x1="525" y1="100" x2="555" y2="100" class="diagram-arrow" marker-end="url(#arrow)"/>
      <rect x="560" y="70" width="100" height="60" rx="6" class="diagram-box research"/>
      <text x="610" y="95" text-anchor="middle" class="diagram-label">Research</text>
      <text x="610" y="115" text-anchor="middle" class="diagram-sublabel">Mod 11</text>
      <line x1="660" y1="100" x2="690" y2="100" class="diagram-arrow" marker-end="url(#arrow)"/>
      <rect x="695" y="55" width="95" height="90" rx="6" class="diagram-box capstone"/>
      <text x="742" y="85" text-anchor="middle" class="diagram-label">Capstone</text>
      <text x="742" y="105" text-anchor="middle" class="diagram-sublabel">Mod 12–13</text>
      <text x="742" y="125" text-anchor="middle" class="diagram-sublabel">Build + Evaluate</text>
    </svg>
  `,

  setup: () => `
    <svg viewBox="0 0 600 220" class="diagram-svg" aria-label="Development environment setup">
      <rect x="200" y="20" width="200" height="50" rx="8" class="diagram-box foundation"/>
      <text x="300" y="50" text-anchor="middle" class="diagram-label">Your Development Environment</text>
      <line x1="300" y1="70" x2="300" y2="95" class="diagram-arrow"/>
      <rect x="50" y="100" width="130" height="55" rx="6" class="diagram-box"/>
      <text x="115" y="125" text-anchor="middle" class="diagram-sublabel">Python 3.10+</text>
      <text x="115" y="142" text-anchor="middle" class="diagram-sublabel">Runtime</text>
      <rect x="235" y="100" width="130" height="55" rx="6" class="diagram-box"/>
      <text x="300" y="125" text-anchor="middle" class="diagram-sublabel">LLM API Key</text>
      <text x="300" y="142" text-anchor="middle" class="diagram-sublabel">OpenAI / Provider</text>
      <rect x="420" y="100" width="130" height="55" rx="6" class="diagram-box"/>
      <text x="485" y="125" text-anchor="middle" class="diagram-sublabel">Packages</text>
      <text x="485" y="142" text-anchor="middle" class="diagram-sublabel">chroma, mem0…</text>
      <line x1="115" y1="155" x2="300" y2="185" class="diagram-arrow"/>
      <line x1="300" y1="155" x2="300" y2="185" class="diagram-arrow"/>
      <line x1="485" y1="155" x2="300" y2="185" class="diagram-arrow"/>
      <rect x="175" y="185" width="250" height="30" rx="6" class="diagram-box core"/>
      <text x="300" y="205" text-anchor="middle" class="diagram-label">Ready to Build Memory Systems</text>
    </svg>
  `,

  "context-window": () => `
    <svg viewBox="0 0 600 240" class="diagram-svg" aria-label="Context window limitation">
      ${ARROW_DEFS}
      <text x="300" y="25" text-anchor="middle" class="diagram-title">The Context Window Problem</text>
      <rect x="40" y="45" width="520" height="50" rx="4" fill="#f8f4ec" stroke="#c4b89a"/>
      <rect x="40" y="45" width="280" height="50" rx="4" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
      <text x="180" y="75" text-anchor="middle" class="diagram-label">Visible Context Window</text>
      <text x="420" y="75" text-anchor="middle" class="diagram-sublabel" fill="#9ca3af">Invisible History (forgotten)</text>
      <line x1="320" y1="45" x2="320" y2="95" stroke="#ef4444" stroke-width="2" stroke-dasharray="4"/>
      <text x="320" y="110" text-anchor="middle" class="diagram-sublabel" fill="#ef4444">Token Limit</text>
      <rect x="80" y="130" width="180" height="40" rx="6" class="diagram-box"/>
      <text x="170" y="155" text-anchor="middle" class="diagram-sublabel">Turn 1: Budget = $50k</text>
      <text x="170" y="195" text-anchor="middle" class="diagram-sublabel" fill="#ef4444">✗ Agent cannot recall</text>
      <rect x="340" y="130" width="180" height="40" rx="6" class="diagram-box core"/>
      <text x="430" y="155" text-anchor="middle" class="diagram-sublabel">Turn 18: What's my budget?</text>
      <path d="M260 150 L330 150" class="diagram-arrow" marker-end="url(#arrow)"/>
    </svg>
  `,

  "vector-search": () => `
    <svg viewBox="0 0 600 260" class="diagram-svg" aria-label="Vector search pipeline">
      <text x="300" y="25" text-anchor="middle" class="diagram-title">Embedding & Vector Search</text>
      <rect x="30" y="50" width="100" height="45" rx="6" class="diagram-box"/>
      <text x="80" y="78" text-anchor="middle" class="diagram-sublabel">Text Input</text>
      <text x="170" y="78" class="diagram-sublabel">→</text>
      <rect x="185" y="50" width="120" height="45" rx="6" class="diagram-box foundation"/>
      <text x="245" y="78" text-anchor="middle" class="diagram-sublabel">Embedding Model</text>
      <text x="330" y="78" class="diagram-sublabel">→</text>
      <rect x="345" y="50" width="100" height="45" rx="6" class="diagram-box"/>
      <text x="395" y="72" text-anchor="middle" class="diagram-sublabel">Vector</text>
      <text x="395" y="87" text-anchor="middle" class="diagram-sublabel">[0.2, -0.5…]</text>
      <text x="470" y="78" class="diagram-sublabel">→</text>
      <rect x="485" y="50" width="85" height="45" rx="6" class="diagram-box core"/>
      <text x="527" y="78" text-anchor="middle" class="diagram-sublabel">Vector DB</text>
      <rect x="100" y="130" width="400" height="110" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
      <text x="300" y="155" text-anchor="middle" class="diagram-label">Cosine Similarity Space</text>
      <circle cx="180" cy="195" r="25" fill="#dbeafe" stroke="#3b82f6"/>
      <text x="180" y="199" text-anchor="middle" class="diagram-sublabel">Query</text>
      <circle cx="300" cy="175" r="20" fill="#bbf7d0" stroke="#22c55e"/>
      <text x="300" y="179" text-anchor="middle" class="diagram-sublabel">Match</text>
      <circle cx="380" cy="210" r="20" fill="#bbf7d0" stroke="#22c55e"/>
      <text x="380" y="214" text-anchor="middle" class="diagram-sublabel">Match</text>
      <circle cx="450" cy="185" r="15" fill="#fecaca" stroke="#ef4444"/>
      <text x="450" y="189" text-anchor="middle" style="font-size:9px">Far</text>
    </svg>
  `,

  "rag-pipeline": () => `
    <svg viewBox="0 0 620 200" class="diagram-svg" aria-label="RAG pipeline">
      ${ARROW_DEFS}
      <text x="310" y="22" text-anchor="middle" class="diagram-title">RAG Pipeline</text>
      ${[
        { x: 20, label: "User Query" },
        { x: 130, label: "Embed Query" },
        { x: 250, label: "Vector Search" },
        { x: 370, label: "Top-k Chunks" },
        { x: 490, label: "LLM + Prompt" }
      ].map((step, i, arr) => `
        <rect x="${step.x}" y="50" width="95" height="50" rx="6" class="diagram-box ${i === 2 ? 'core' : ''}"/>
        <text x="${step.x + 47}" y="80" text-anchor="middle" class="diagram-sublabel">${step.label}</text>
        ${i < arr.length - 1 ? `<line x1="${step.x + 95}" y1="75" x2="${arr[i+1].x}" y2="75" class="diagram-arrow" marker-end="url(#arrow)"/>` : ''}
      `).join('')}
      <rect x="200" y="130" width="220" height="55" rx="6" class="diagram-box foundation"/>
      <text x="310" y="155" text-anchor="middle" class="diagram-label">Static Knowledge Base (PDFs, Docs)</text>
      <text x="310" y="172" text-anchor="middle" class="diagram-sublabel">Read-only — not updated during conversation</text>
      <line x1="310" y1="100" x2="310" y2="130" class="diagram-arrow"/>
    </svg>
  `,

  "memory-types": () => `
    <svg viewBox="0 0 600 280" class="diagram-svg" aria-label="Memory types">
      <text x="300" y="25" text-anchor="middle" class="diagram-title">Agent Memory Taxonomy</text>
      <rect x="30" y="50" width="160" height="80" rx="8" class="diagram-box foundation"/>
      <text x="110" y="78" text-anchor="middle" class="diagram-label">Episodic</text>
      <text x="110" y="98" text-anchor="middle" class="diagram-sublabel">Specific events</text>
      <text x="110" y="115" text-anchor="middle" class="diagram-sublabel">"Refund asked Mar 3"</text>
      <rect x="220" y="50" width="160" height="80" rx="8" class="diagram-box core"/>
      <text x="300" y="78" text-anchor="middle" class="diagram-label">Semantic</text>
      <text x="300" y="98" text-anchor="middle" class="diagram-sublabel">General facts</text>
      <text x="300" y="115" text-anchor="middle" class="diagram-sublabel">"Works at startup"</text>
      <rect x="410" y="50" width="160" height="80" rx="8" class="diagram-box intermediate"/>
      <text x="490" y="78" text-anchor="middle" class="diagram-label">Procedural</text>
      <text x="490" y="98" text-anchor="middle" class="diagram-sublabel">Preferences</text>
      <text x="490" y="115" text-anchor="middle" class="diagram-sublabel">"Use bullet points"</text>
      <rect x="150" y="170" width="300" height="90" rx="8" class="diagram-box advanced"/>
      <text x="300" y="198" text-anchor="middle" class="diagram-label">Memory Lifecycle</text>
      <text x="300" y="222" text-anchor="middle" class="diagram-sublabel">Capture → Extract → Store → Retrieve → Inject → Decay</text>
      <line x1="110" y1="130" x2="200" y2="170" class="diagram-arrow"/>
      <line x1="300" y1="130" x2="300" y2="170" class="diagram-arrow"/>
      <line x1="490" y1="130" x2="400" y2="170" class="diagram-arrow"/>
    </svg>
  `,

  "memory-ops": () => `
    <svg viewBox="0 0 600 250" class="diagram-svg" aria-label="Memory operations routing">
      <text x="300" y="25" text-anchor="middle" class="diagram-title">ADD / UPDATE / DELETE / NOOP Routing</text>
      <rect x="220" y="45" width="160" height="40" rx="6" class="diagram-box"/>
      <text x="300" y="70" text-anchor="middle" class="diagram-sublabel">New Fact from Conversation</text>
      <line x1="300" y1="85" x2="300" y2="105" class="diagram-arrow"/>
      <rect x="200" y="105" width="200" height="40" rx="6" class="diagram-box foundation"/>
      <text x="300" y="130" text-anchor="middle" class="diagram-sublabel">Compare vs Top-k Similar Memories</text>
      <line x1="300" y1="145" x2="300" y2="165" class="diagram-arrow"/>
      <rect x="220" y="165" width="160" height="35" rx="6" class="diagram-box core"/>
      <text x="300" y="187" text-anchor="middle" class="diagram-sublabel">LLM Routing Decision</text>
      ${[
        { x: 30, label: "ADD", color: "foundation" },
        { x: 165, label: "UPDATE", color: "core" },
        { x: 300, label: "DELETE", color: "intermediate" },
        { x: 435, label: "NOOP", color: "" }
      ].map(s => `
        <line x1="300" y1="200" x2="${s.x + 55}" y2="215" class="diagram-arrow"/>
        <rect x="${s.x}" y="215" width="110" height="30" rx="6" class="diagram-box ${s.color}"/>
        <text x="${s.x + 55}" y="235" text-anchor="middle" class="diagram-sublabel">${s.label}</text>
      `).join('')}
    </svg>
  `,

  "knowledge-graph": () => `
    <svg viewBox="0 0 600 240" class="diagram-svg" aria-label="Knowledge graph structure">
      <text x="300" y="25" text-anchor="middle" class="diagram-title">Knowledge Graph for Memory</text>
      <circle cx="300" cy="120" r="35" fill="#dbeafe" stroke="#1e40af" stroke-width="2"/>
      <text x="300" y="125" text-anchor="middle" class="diagram-label">User</text>
      <circle cx="130" cy="80" r="30" fill="#bbf7d0" stroke="#166534" stroke-width="2"/>
      <text x="130" y="85" text-anchor="middle" class="diagram-sublabel">Acme Corp</text>
      <circle cx="470" cy="80" r="30" fill="#bbf7d0" stroke="#166534" stroke-width="2"/>
      <text x="470" y="85" text-anchor="middle" class="diagram-sublabel">StartupX</text>
      <circle cx="130" cy="180" r="28" fill="#fde68a" stroke="#b45309" stroke-width="2"/>
      <text x="130" y="185" text-anchor="middle" class="diagram-sublabel">Product A</text>
      <circle cx="470" cy="180" r="28" fill="#fde68a" stroke="#b45309" stroke-width="2"/>
      <text x="470" y="185" text-anchor="middle" class="diagram-sublabel">Jane (mgr)</text>
      <line x1="270" y1="100" x2="160" y2="85" stroke="#1e3a5f" stroke-width="2"/>
      <text x="200" y="82" class="diagram-sublabel">works_at</text>
      <line x1="330" y1="100" x2="440" y2="85" stroke="#1e3a5f" stroke-width="2"/>
      <text x="400" y="82" class="diagram-sublabel">worked_at</text>
      <line x1="270" y1="140" x2="155" y2="165" stroke="#1e3a5f" stroke-width="2"/>
      <text x="195" y="160" class="diagram-sublabel">purchased</text>
      <line x1="330" y1="140" x2="445" y2="165" stroke="#1e3a5f" stroke-width="2"/>
      <text x="405" y="160" class="diagram-sublabel">reports_to</text>
      <text x="300" y="225" text-anchor="middle" class="diagram-sublabel">Relational queries: "What companies has this user worked at?"</text>
    </svg>
  `,

  "hybrid-retrieval": () => `
    <svg viewBox="0 0 600 260" class="diagram-svg" aria-label="Hybrid retrieval fusion">
      ${ARROW_DEFS}
      <text x="300" y="25" text-anchor="middle" class="diagram-title">Hybrid Retrieval Fusion</text>
      <rect x="230" y="45" width="140" height="40" rx="6" class="diagram-box"/>
      <text x="300" y="70" text-anchor="middle" class="diagram-sublabel">User Query</text>
      <line x1="300" y1="85" x2="300" y2="105" class="diagram-arrow"/>
      ${[
        { x: 40, label: "Semantic\n(Vector)", cls: "foundation" },
        { x: 230, label: "Keyword\n(BM25)", cls: "core" },
        { x: 420, label: "Entity\n(Graph)", cls: "intermediate" }
      ].map(s => `
        <line x1="300" y1="105" x2="${s.x + 70}" y2="120" class="diagram-arrow"/>
        <rect x="${s.x}" y="120" width="140" height="55" rx="6" class="diagram-box ${s.cls}"/>
        <text x="${s.x + 70}" y="145" text-anchor="middle" class="diagram-sublabel">${s.label.split('\n')[0]}</text>
        <text x="${s.x + 70}" y="162" text-anchor="middle" class="diagram-sublabel">${s.label.split('\n')[1]}</text>
        <line x1="${s.x + 70}" y1="175" x2="300" y2="200" class="diagram-arrow"/>
      `).join('')}
      <rect x="200" y="200" width="200" height="45" rx="6" class="diagram-box advanced"/>
      <text x="300" y="222" text-anchor="middle" class="diagram-label">Score Fusion & Ranking</text>
      <text x="300" y="238" text-anchor="middle" class="diagram-sublabel">Weighted combination → Final results</text>
    </svg>
  `,

  "mcp-integration": () => `
    <svg viewBox="0 0 600 240" class="diagram-svg" aria-label="MCP integration architecture">
      <text x="300" y="25" text-anchor="middle" class="diagram-title">MCP Integration Architecture</text>
      ${[
        { x: 40, label: "Claude" },
        { x: 160, label: "Cursor" },
        { x: 280, label: "Custom Agent" }
      ].map(c => `
        <rect x="${c.x}" y="45" width="90" height="40" rx="6" class="diagram-box"/>
        <text x="${c.x + 45}" y="70" text-anchor="middle" class="diagram-sublabel">${c.label}</text>
        <line x1="${c.x + 45}" y1="85" x2="300" y2="115" class="diagram-arrow"/>
      `).join('')}
      <rect x="200" y="115" width="200" height="45" rx="6" class="diagram-box foundation"/>
      <text x="300" y="135" text-anchor="middle" class="diagram-label">MCP Server</text>
      <text x="300" y="152" text-anchor="middle" class="diagram-sublabel">remember() · recall()</text>
      <line x1="300" y1="160" x2="300" y2="180" class="diagram-arrow"/>
      <rect x="150" y="180" width="300" height="45" rx="6" class="diagram-box core"/>
      <text x="300" y="200" text-anchor="middle" class="diagram-label">Memory Service (Multi-tenant)</text>
      <text x="300" y="217" text-anchor="middle" class="diagram-sublabel">tenant_a · tenant_b · tenant_c</text>
    </svg>
  `,

  "production-systems": () => `
    <svg viewBox="0 0 600 220" class="diagram-svg" aria-label="Production memory systems comparison">
      <text x="300" y="25" text-anchor="middle" class="diagram-title">Production Memory Systems Landscape</text>
      ${[
        { x: 30, name: "Mem0", focus: "Vector + Routing", cls: "foundation" },
        { x: 160, name: "Zep", focus: "Temporal Graph", cls: "core" },
        { x: 290, name: "Letta", focus: "OS-style Paging", cls: "intermediate" },
        { x: 420, name: "Cognee", focus: "Local-first 4-op", cls: "advanced" },
        { x: 490, name: "Supermemory", focus: "MCP-native", cls: "research" }
      ].map((s, i) => `
        <rect x="${s.x}" y="55" width="${i === 4 ? 90 : 110}" height="70" rx="6" class="diagram-box ${s.cls}"/>
        <text x="${s.x + (i === 4 ? 45 : 55)}" y="85" text-anchor="middle" class="diagram-label">${s.name}</text>
        <text x="${s.x + (i === 4 ? 45 : 55)}" y="108" text-anchor="middle" class="diagram-sublabel">${s.focus}</text>
      `).join('')}
      <rect x="100" y="155" width="400" height="50" rx="6" class="diagram-box"/>
      <text x="300" y="178" text-anchor="middle" class="diagram-sublabel">Compare: API design · Retrieval quality · Setup friction · Optimization focus</text>
    </svg>
  `,

  "unsolved-problems": () => `
    <svg viewBox="0 0 600 250" class="diagram-svg" aria-label="Open research problems">
      <text x="300" y="25" text-anchor="middle" class="diagram-title">Open Research Problems</text>
      <circle cx="300" cy="130" r="45" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
      <text x="300" y="125" text-anchor="middle" class="diagram-label">Memory</text>
      <text x="300" y="142" text-anchor="middle" class="diagram-sublabel">Frontier</text>
      ${[
        { x: 60, y: 60, label: "Staleness" },
        { x: 480, y: 60, label: "Identity" },
        { x: 60, y: 190, label: "Contradictions" },
        { x: 480, y: 190, label: "Multi-agent" },
        { x: 300, y: 220, label: "Novelty Gating" }
      ].map(p => `
        <rect x="${p.x - 50}" y="${p.y - 15}" width="100" height="30" rx="6" class="diagram-box intermediate"/>
        <text x="${p.x}" y="${p.y + 5}" text-anchor="middle" class="diagram-sublabel">${p.label}</text>
        <line x1="300" y1="130" x2="${p.x}" y2="${p.y}" stroke="#d97706" stroke-width="1" stroke-dasharray="4"/>
      `).join('')}
    </svg>
  `,

  "research-papers": () => `
    <svg viewBox="0 0 600 220" class="diagram-svg" aria-label="Research paper reading path">
      ${ARROW_DEFS}
      <text x="300" y="25" text-anchor="middle" class="diagram-title">Research Reading Path</text>
      ${[
        { x: 30, label: "Mem0\nRouting" },
        { x: 155, label: "A-Mem\nZettelkasten" },
        { x: 280, label: "MemEngine\nSurvey" },
        { x: 405, label: "2026 Survey\nFrontier" }
      ].map((p, i, arr) => `
        <rect x="${p.x}" y="55" width="110" height="55" rx="6" class="diagram-box ${['foundation','core','intermediate','advanced'][i]}"/>
        <text x="${p.x + 55}" y="80" text-anchor="middle" class="diagram-sublabel">${p.label.split('\n')[0]}</text>
        <text x="${p.x + 55}" y="97" text-anchor="middle" class="diagram-sublabel">${p.label.split('\n')[1]}</text>
        ${i < arr.length - 1 ? `<line x1="${p.x + 110}" y1="82" x2="${arr[i+1].x}" y2="82" class="diagram-arrow" marker-end="url(#arrow)"/>` : ''}
      `).join('')}
      <line x1="300" y1="110" x2="300" y2="140" class="diagram-arrow"/>
      <rect x="150" y="140" width="300" height="60" rx="6" class="diagram-box research"/>
      <text x="300" y="165" text-anchor="middle" class="diagram-label">Build Mini Evaluation Harness</text>
      <text x="300" y="185" text-anchor="middle" class="diagram-sublabel">LoCoMo · LongMemEval · DMR · ConvoMem</text>
    </svg>
  `,

  capstone: () => `
    <svg viewBox="0 0 620 260" class="diagram-svg" aria-label="Capstone project pipeline">
      ${ARROW_DEFS}
      <text x="310" y="25" text-anchor="middle" class="diagram-title">Capstone: End-to-End Memory System</text>
      ${[
        { x: 30, y: 50, w: 130, label: "1. Fact Schema", sub: "Types, decay, contradictions" },
        { x: 175, y: 50, w: 130, label: "2. Pipeline", sub: "Extract → Store → Retrieve" },
        { x: 320, y: 50, w: 130, label: "3. Evaluation", sub: "Precision, latency, cost" },
        { x: 465, y: 50, w: 130, label: "4. Dogfood", sub: "20+ real interactions" }
      ].map(s => `
        <rect x="${s.x}" y="${s.y}" width="${s.w}" height="65" rx="6" class="diagram-box capstone"/>
        <text x="${s.x + s.w/2}" y="${s.y + 28}" text-anchor="middle" class="diagram-label">${s.label}</text>
        <text x="${s.x + s.w/2}" y="${s.y + 48}" text-anchor="middle" class="diagram-sublabel">${s.sub}</text>
      `).join('')}
      <line x1="160" y1="82" x2="175" y2="82" class="diagram-arrow" marker-end="url(#arrow)"/>
      <line x1="305" y1="82" x2="320" y2="82" class="diagram-arrow" marker-end="url(#arrow)"/>
      <line x1="450" y1="82" x2="465" y2="82" class="diagram-arrow" marker-end="url(#arrow)"/>
      <rect x="80" y="150" width="460" height="90" rx="8" class="diagram-box advanced"/>
      <text x="310" y="178" text-anchor="middle" class="diagram-label">End-to-End Architecture</text>
      <text x="310" y="200" text-anchor="middle" class="diagram-sublabel">Ingestion → Fact Extraction → Vector Store + Graph → Hybrid Retrieval → MCP/SDK</text>
      <text x="310" y="222" text-anchor="middle" class="diagram-sublabel">Measurable retrieval quality for your use case</text>
    </svg>
  `,

  "production-patterns": () => `
    <svg viewBox="0 0 600 230" class="diagram-svg" aria-label="Production patterns framework">
      <text x="300" y="25" text-anchor="middle" class="diagram-title">Production Memory Patterns</text>
      <rect x="200" y="50" width="200" height="45" rx="6" class="diagram-box capstone"/>
      <text x="300" y="78" text-anchor="middle" class="diagram-label">Agent Memory System</text>
      ${[
        { x: 50, label: "API Design", sub: "Store / Recall / Search" },
        { x: 225, label: "Integration", sub: "MCP + SDKs" },
        { x: 400, label: "Operations", sub: "Latency + Cost" }
      ].map(s => `
        <line x1="300" y1="95" x2="${s.x + 75}" y2="120" class="diagram-arrow"/>
        <rect x="${s.x}" y="120" width="150" height="55" rx="6" class="diagram-box foundation"/>
        <text x="${s.x + 75}" y="145" text-anchor="middle" class="diagram-sublabel">${s.label}</text>
        <text x="${s.x + 75}" y="162" text-anchor="middle" class="diagram-sublabel">${s.sub}</text>
      `).join('')}
      <rect x="125" y="195" width="350" height="30" rx="6" class="diagram-box core"/>
      <text x="300" y="215" text-anchor="middle" class="diagram-sublabel">Reliable memory for real-world agent workflows</text>
    </svg>
  `,

};

export function renderDiagram(key: string): string {
  const resolved = key === "business" ? "production-patterns" : key;
  const fn = DIAGRAMS[resolved as keyof typeof DIAGRAMS] || DIAGRAMS["learning-path"];
  return fn();
}
