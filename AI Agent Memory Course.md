# AI Agent Memory Systems — Full Detailed Course

This is the complete lesson content for all 13 modules — full explanations, code, worked examples, not just outlines.

---

# MODULE 0 — Setup

Install everything up front so nothing blocks you later:

```bash
pip install openai chromadb langchain langchain-openai mem0ai cognee networkx rank_bm25
```

You'll need an OpenAI API key (or swap in any provider — Anthropic, local models via Ollama — the concepts are identical, only the SDK call changes).

Test that everything works:

```python
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Say hello in 5 words"}]
)
print(response.choices[0].message.content)
```

If this prints a response, you're set up correctly. Everything downstream builds on this single call pattern.

---

# MODULE 1 — Why Memory Is a Problem

### The core issue, explained properly

A large language model doesn't "run" the way a normal program does, with variables that persist in memory (RAM). Every single time you call the API, you're starting a **brand new, blank conversation** from the model's point of view. The only reason ChatGPT-style apps feel continuous is that the *application* re-sends you the entire conversation transcript every single time, and the model reads that transcript fresh, as if for the first time.

This has a very concrete consequence: if you don't explicitly include something in the prompt, the model has **zero knowledge of it**, no matter how many times you discussed it in "previous" turns.

### Why the naive fix (resend everything) breaks

Let's actually measure this instead of just asserting it.

```python
from openai import OpenAI
client = OpenAI()

conversation = []

def chat(user_message):
    conversation.append({"role": "user", "content": user_message})
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=conversation
    )
    reply = response.choices[0].message.content
    conversation.append({"role": "assistant", "content": reply})
    # print token usage to watch it grow
    print(f"Tokens this turn: {response.usage.total_tokens}")
    return reply

for i in range(20):
    chat(f"This is turn {i}. Just say 'ok {i}'.")
```

Run this and watch the printed token count. It grows roughly linearly — turn 1 might cost 20 tokens, turn 20 might cost 400+ tokens, because you're re-sending everything each time. Extrapolate this to a real product with long user sessions: costs compound turn over turn, and eventually you hit the model's hard context limit (e.g., 128k or 200k tokens) and the app simply breaks or starts silently dropping old messages.

### The three failure modes, concretely

1. **Cost**: you pay for the same old tokens again and again, every single turn.
2. **Context limit**: eventually you run out of room entirely.
3. **Retrieval quality drops**: even *before* you hit the hard limit, stuffing 50 turns of chat into the prompt means the genuinely relevant fact ("user's budget is $10k") is buried in noise, and models are measurably worse at using information buried in the middle of a long context than information near the start or end (a well-documented phenomenon sometimes called "lost in the middle").

### Why this specifically breaks *agents* (not just chatbots)

A chatbot forgetting your name is mildly annoying. An agent forgetting:
- that it already sent an email to this lead → sends a duplicate, looks unprofessional
- that the user already tried a troubleshooting step → tells them to try it again, erodes trust
- what a customer's stated budget was three calls ago → makes a proposal that's obviously wrong

...actively breaks the product's usefulness. This is why memory is treated as **load-bearing infrastructure**, not a nice-to-have feature, for any serious agent product.

### Hands-on exercise
1. Run the script above, log the token count per turn to a CSV, plot it — see the linear growth yourself.
2. Now modify the script to only keep the last 3 turns in `conversation`. Ask a question that requires turn-1 information (e.g., "what was the very first thing I said?") at turn 15 — watch it fail, because that information is now truly gone from what the model sees.

### Checkpoint questions (answer these to yourself before moving on)
- Why can't you just increase the context window infinitely to solve this?
- If tokens are the "cost" of memory, what's the "cost" of *not* having memory, in product terms?

---

# MODULE 2 — Embeddings & Vector Search

### What an embedding actually is

An embedding model takes a piece of text and outputs a fixed-length list of numbers (a vector) — typically 384, 768, or 1536 numbers depending on the model. The key property: **texts with similar meaning produce vectors that are numerically close together**, even if they don't share any of the same words.

Example: "I love my dog" and "My pet means the world to me" will have embeddings that are close together, despite sharing almost no vocabulary. "I love my dog" and "The stock market crashed today" will be far apart.

### Cosine similarity — the actual math

Given two vectors A and B, cosine similarity measures the angle between them:

```
cosine_similarity(A, B) = (A · B) / (||A|| × ||B||)
```

Where `A · B` is the dot product and `||A||` is the magnitude (length) of vector A. The result ranges from -1 (opposite meaning) to 1 (identical meaning), with 0 meaning unrelated.

```python
import numpy as np

def cosine_similarity(a, b):
    a, b = np.array(a), np.array(b)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
```

You almost never need to write this yourself in production (vector DBs do it internally, optimized), but you should understand it since it's the single most-used operation in this entire field.

### Getting real embeddings and comparing them

```python
from openai import OpenAI
client = OpenAI()

def embed(text):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

sentences = [
    "I love my dog",
    "My pet means the world to me",
    "The stock market crashed today",
    "Tech stocks fell sharply this morning"
]

vectors = [embed(s) for s in sentences]

for i in range(len(sentences)):
    for j in range(i+1, len(sentences)):
        sim = cosine_similarity(vectors[i], vectors[j])
        print(f"{sentences[i]!r} vs {sentences[j]!r}: {sim:.3f}")
```

Run this — you'll see the "dog"/"pet" pair score high (likely 0.6-0.8+) and the "dog" vs "stocks" pairs score noticeably lower. This confirms embeddings capture *meaning*, not just word overlap.

### Vector databases — why you need a special database at all

Once you have thousands or millions of embeddings, computing cosine similarity against every single one for every query (brute force) becomes too slow. Vector databases use approximate nearest neighbor (ANN) algorithms — most commonly **HNSW** (Hierarchical Navigable Small World graphs) — to find the top-k closest vectors in roughly logarithmic time instead of linear time, trading a tiny bit of accuracy for massive speed gains.

Common choices:
- **Chroma** — simplest, runs locally, zero setup, great for learning/prototyping
- **pgvector** — a Postgres extension, good if you already run Postgres and don't want a separate DB
- **Qdrant / Weaviate / Pinecone** — purpose-built, better at scale (millions+ vectors), managed hosting options

### Building your first local vector store

```python
import chromadb

chroma_client = chromadb.Client()
collection = chroma_client.create_collection(name="test_memory")

collection.add(
    documents=[
        "User's favorite color is blue",
        "User works at a fintech startup",
        "User mentioned they're allergic to peanuts",
    ],
    ids=["fact1", "fact2", "fact3"]
)

results = collection.query(
    query_texts=["What food should I avoid recommending?"],
    n_results=1
)
print(results['documents'])
# Should return the peanut allergy fact, even though "food" and "recommending"
# never appear in the stored text — that's semantic search working.
```

### Chunking — why it matters

If you embed an entire 10-page document as one vector, that vector becomes a blurry "average" of everything in the document — a query about page 7 might not match well because the vector is diluted by pages 1-6 and 8-10. **Chunking** splits documents into smaller pieces (commonly 200-500 tokens, sometimes with overlap between chunks so you don't cut a sentence in half at a boundary) before embedding each piece separately.

```python
def chunk_text(text, chunk_size=300, overlap=50):
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunks.append(" ".join(words[start:end]))
        start += chunk_size - overlap
    return chunks
```

### Hands-on exercise
1. Run the sentence-comparison script above with at least 6 sentences across 3 distinct topics — verify semantic clustering happens.
2. Build the Chroma example above, add 20 facts, query with 5 different questions, manually judge if the retrieved facts are actually the right ones.
3. Take a long document (a Wikipedia article works), chunk it two ways — 100-word chunks and 500-word chunks — embed both versions, and compare retrieval quality on the same 3 questions. Notice the precision/context tradeoff.

### Checkpoint questions
- Why can't you compare embeddings from two different embedding models directly?
- What would go wrong if your chunks were 5000 words each? What if they were 10 words each?

---

# MODULE 3 — RAG (Retrieval Augmented Generation)

### The full pipeline, explained step by step

RAG has exactly four steps:
1. **Embed the user's query** using the same embedding model you used to embed your documents
2. **Vector search** — find the top-k most similar chunks in your vector store
3. **Construct an augmented prompt** — take the retrieved chunks and insert them into the prompt, along with instructions telling the model to answer using only that context
4. **Generate** — send the augmented prompt to the LLM, get an answer grounded in the retrieved text

### A complete manual RAG implementation (no framework, so you see every piece)

```python
import chromadb
from openai import OpenAI

client = OpenAI()
chroma_client = chromadb.Client()
collection = chroma_client.create_collection(name="rag_demo")

# Step 0: index some documents (one-time setup)
documents = [
    "Our refund policy allows returns within 30 days of purchase with a receipt.",
    "Shipping takes 5-7 business days for standard delivery within the US.",
    "Premium support is available for Enterprise plan customers only.",
]
collection.add(documents=documents, ids=[f"doc{i}" for i in range(len(documents))])

def rag_answer(query):
    # Step 1 & 2: embed + search (Chroma handles the embedding call internally here)
    results = collection.query(query_texts=[query], n_results=2)
    retrieved_chunks = results['documents'][0]

    # Step 3: construct augmented prompt
    context = "\n".join(retrieved_chunks)
    prompt = f"""Answer the question using ONLY the context below. 
If the answer isn't in the context, say "I don't have that information."

Context:
{context}

Question: {query}
Answer:"""

    # Step 4: generate
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

print(rag_answer("How long do I have to return something?"))
print(rag_answer("What's your policy on pet adoptions?"))  # should say "I don't have that"
```

### Why RAG is not the same thing as memory

This is the single most important conceptual distinction in this whole course, so read this twice:

- RAG's knowledge base (the `documents` list above) is **static** — it was written once, by you, ahead of time. The conversation doesn't change it.
- **Memory** is built *from the conversation itself*, in real time. If the user says "actually my budget is $15k, not $10k," a memory system needs to *write* a new fact and potentially *overwrite* an old one — RAG has no concept of this at all, it only reads.

Every memory system you'll study from Module 4 onward is essentially "RAG, plus a write path, plus logic for handling contradictions and staleness." RAG is the read half of memory; it's necessary but not sufficient.

### Top-k and re-ranking

`n_results=2` in the code above is your **top-k** parameter. Too low and you might miss the right chunk; too high and you dilute the prompt with irrelevant text (which both costs more tokens and can measurably confuse the model). A common production pattern: retrieve a larger set (e.g., top 20) with cheap vector search, then **re-rank** that smaller set with a more expensive, more accurate model (a cross-encoder, or even an LLM call) to pick the true top 3-5 before generating the answer.

### Hands-on exercise
1. Build the exact pipeline above, run it against 10 questions, 5 answerable and 5 not — verify it correctly says "I don't have that information" for the unanswerable ones (this is the difference between a grounded system and a hallucinating one).
2. Add a re-ranking step: retrieve top-10, then use an LLM call to pick which 2 are actually most relevant before generating the final answer. Compare answer quality to no re-ranking.

### Checkpoint questions
- In your own words, what's the one-sentence difference between RAG and agent memory?
- Why would blindly increasing top-k not always improve answer quality?

---

# MODULE 4 — Agent Memory Fundamentals

### The three memory types, with real examples

**Episodic memory** — specific events, tied to a particular moment:
- "On March 3rd, the user asked about the refund policy and seemed frustrated"
- "In the last call, the sales rep promised a follow-up by Friday"

**Semantic memory** — general, timeless-ish facts about the world or the user:
- "The user's company has ~50 employees"
- "The user prefers email over phone calls"

**Procedural memory** — learned behavior about *how* to act, not *what* is true:
- "Always confirm order details before processing a refund for this user"
- "This user gets annoyed by overly long responses — keep answers short"

### Why the distinction matters practically

These three types should usually be **stored and decayed differently**:
- Episodic memories often matter less as time passes (an event from 6 months ago is less relevant than one from yesterday) — good candidates for time-based decay.
- Semantic memories tend to be more stable but need active contradiction-checking (a "user's company size" fact should be checked/updated periodically, not just accumulated forever).
- Procedural memories are often the most valuable long-term, since they encode learned behavior that improves the agent's usefulness over time, and they change relatively rarely.

If you store all three types identically (same decay rule, same storage, same retrieval weighting), you'll end up either losing valuable long-term behavioral learnings too fast, or clogging retrieval with stale one-off events.

### Working memory vs. long-term memory

**Working memory** = what's currently in the LLM's context window for this specific turn. **Long-term memory** = everything stored externally (vector DB, graph DB) that gets selectively retrieved and injected into working memory only when relevant.

Think of it like RAM (working memory — fast, but wiped when the session ends) vs. a hard drive (long-term memory — slower to access, but persists and only the relevant files get loaded into RAM when needed). This RAM/disk analogy is literally the design inspiration behind MemGPT/Letta (Module 9).

### The memory lifecycle, end to end

```
1. Capture   → raw conversation turn happens
2. Extract   → LLM pulls out discrete facts from the raw turn
3. Store     → facts get embedded/graphed and saved
4. Retrieve  → on a new query, relevant facts are fetched
5. Inject    → retrieved facts are added to the prompt (working memory)
6. Decay/Forget → over time, irrelevant or stale facts get down-weighted or deleted
```

Every module from here builds out one piece of this lifecycle in depth.

### Hands-on exercise
Take this sample conversation:

```
User: Hi, I'm looking into your Enterprise plan for my company.
Agent: Great! How many employees do you have?
User: We're about 50 people right now, growing fast though.
Agent: Got it. What's your main use case?
User: Mainly for internal support automation. Also, quick note — 
      please always email me, I never check Slack.
User: Actually wait, we just closed a round, we're closer to 80 
      employees now.
```

Manually write out every fact you can extract, and classify each as episodic / semantic / procedural.

### Checkpoint questions
- Which fact type should decay fastest in most products, and why?
- Give an example where treating a semantic fact like an episodic one would cause a real bug.

---

# MODULE 5 — Memory Operations & Fact Extraction

### Fact extraction — turning raw text into structured memory

Instead of storing "User: We're about 50 people right now, growing fast though" verbatim, you want an LLM to extract: `{"fact": "Company has approximately 50 employees", "confidence": "stated by user", "type": "semantic"}`.

```python
import json
from openai import OpenAI
client = OpenAI()

EXTRACTION_PROMPT = """Extract discrete factual statements from this conversation turn.
Return a JSON list of objects, each with "fact" (a clear standalone statement) 
and "type" (one of: episodic, semantic, procedural).
Only extract genuinely new information, not questions or filler.

Conversation turn:
{turn}

JSON:"""

def extract_facts(turn):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": EXTRACTION_PROMPT.format(turn=turn)}],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)

facts = extract_facts("We're about 50 people right now, growing fast though.")
print(facts)
```

### The ADD / UPDATE / DELETE / NOOP routing pattern

For every new candidate fact, before blindly storing it, check it against similar existing memories and decide what to do:

```python
ROUTING_PROMPT = """You are managing a memory store. Given a NEW fact and a list 
of EXISTING similar facts already stored, decide the correct operation:
- ADD: the new fact is genuinely new information
- UPDATE: the new fact refines or corrects an existing one (specify which existing fact id)
- DELETE: the new fact means an existing fact is no longer true (specify which existing fact id)
- NOOP: the new fact adds nothing new

NEW fact: {new_fact}
EXISTING facts: {existing_facts}

Respond with JSON: {{"operation": "...", "target_id": "..." or null, "reasoning": "..."}}"""

def route_fact(new_fact, existing_facts):
    prompt = ROUTING_PROMPT.format(new_fact=new_fact, existing_facts=existing_facts)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)

# Example: this should trigger an UPDATE
existing = [{"id": "fact_1", "text": "Company has approximately 50 employees"}]
new = "We just closed a round, we're closer to 80 employees now"
print(route_fact(new, existing))
# Expect: {"operation": "UPDATE", "target_id": "fact_1", "reasoning": "..."}
```

### Wiring it together — a minimal end-to-end memory write path

```python
import chromadb
chroma_client = chromadb.Client()
memory_collection = chroma_client.create_collection(name="agent_memory")

def get_similar_facts(new_fact_text, k=3):
    if memory_collection.count() == 0:
        return []
    results = memory_collection.query(query_texts=[new_fact_text], n_results=k)
    return [{"id": id_, "text": doc} for id_, doc in 
            zip(results['ids'][0], results['documents'][0])]

def process_new_fact(fact_text):
    similar = get_similar_facts(fact_text)
    decision = route_fact(fact_text, similar)
    
    if decision["operation"] == "ADD":
        new_id = f"fact_{memory_collection.count()}"
        memory_collection.add(documents=[fact_text], ids=[new_id])
        print(f"ADDED: {fact_text}")
    elif decision["operation"] == "UPDATE":
        memory_collection.update(ids=[decision["target_id"]], documents=[fact_text])
        print(f"UPDATED {decision['target_id']}: {fact_text}")
    elif decision["operation"] == "DELETE":
        memory_collection.delete(ids=[decision["target_id"]])
        print(f"DELETED {decision['target_id']}")
    else:
        print(f"NOOP: {fact_text}")

process_new_fact("Company has approximately 50 employees")
process_new_fact("We just closed a round, we're closer to 80 employees now")
```

Run this — you should see the first call ADD, and the second call UPDATE (overwriting the same memory slot rather than creating a duplicate, contradicting entry).

### Why this routing call is the main cost driver

Every single new fact requires an LLM call to classify it. If your agent processes thousands of conversations, this routing cost adds up fast — this is exactly why "novelty gating" (skip the LLM call for obviously-new, obviously-irrelevant facts using a cheap similarity threshold check first) becomes important at scale (covered more in Module 10).

### Hands-on exercise
1. Build the full pipeline above yourself, don't just read it — run it on a 10-turn synthetic conversation where the user states, then later contradicts, 3 different facts.
2. Verify all 3 contradictions correctly trigger UPDATE, not duplicate ADD.
3. Deliberately feed it a fact that should be a NOOP (something already effectively stored) and verify it's correctly ignored.

### Checkpoint questions
- Why is storing raw conversation transcripts a worse default than extracting structured facts?
- What would happen to retrieval quality over time if you never implemented UPDATE/DELETE, only ADD?

---

# MODULE 6 — Knowledge Graphs for Memory

### Why vector search alone struggles with relationships

Vector search answers "what text is semantically similar to this query." It's genuinely bad at questions like "who did the user mention working with," "what happened before the refund request," or "trace how this decision was made" — these require understanding **explicit relationships between entities**, not just semantic similarity of isolated facts.

### Entities and relationships, concretely

Take the fact: "Sarah, the CTO at Acme Corp, introduced our sales rep to their CFO last Tuesday."

- **Entities**: Sarah (person), Acme Corp (organization), CFO (person, unnamed), sales rep (person)
- **Relationships**: Sarah `works_at` Acme Corp (as CTO), Sarah `introduced` sales rep `to` CFO, this happened `on` last Tuesday

A graph represents this as nodes (entities) connected by edges (relationships), often with properties attached (like the date).

### A minimal graph implementation with NetworkX (for learning — not production scale)

```python
import networkx as nx

graph = nx.MultiDiGraph()

graph.add_node("Sarah", type="person")
graph.add_node("Acme Corp", type="organization")
graph.add_node("CFO_of_Acme", type="person")

graph.add_edge("Sarah", "Acme Corp", relationship="works_at", role="CTO")
graph.add_edge("Sarah", "CFO_of_Acme", relationship="introduced_to_sales_rep", date="last Tuesday")

# Query: what is Sarah connected to?
for neighbor in graph.neighbors("Sarah"):
    edge_data = graph.get_edge_data("Sarah", neighbor)
    print(f"Sarah -> {neighbor}: {edge_data}")
```

### Extracting entities/relationships from text with an LLM

```python
GRAPH_EXTRACTION_PROMPT = """Extract entities and relationships from this text as JSON.
Format: {{"entities": [{{"name": "...", "type": "person|organization|product|other"}}],
"relationships": [{{"source": "...", "relationship": "...", "target": "...", "date": "... or null"}}]}}

Text: {text}
JSON:"""

def extract_graph(text):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": GRAPH_EXTRACTION_PROMPT.format(text=text)}],
        response_format={"type": "json_object"}
    )
    return json.loads(response.choices[0].message.content)

result = extract_graph("Sarah, the CTO at Acme Corp, introduced our sales rep to their CFO last Tuesday.")
print(result)
```

### Temporal knowledge graphs — adding the "when"

The advanced version of this (what Zep's Graphiti does) attaches validity time ranges to relationships, so the graph can answer both "what's true now" and "what was true at time X." Example: if "Sarah works at Acme Corp" is true from Jan 2024 to present, but then you learn "Sarah left Acme Corp in June 2026 and joined Beta Inc," a temporal graph keeps *both* facts with their time ranges, rather than just overwriting — so a query like "who did Sarah work for last year" still resolves correctly, while "who does Sarah work for now" resolves to Beta Inc.

### When to use a graph vs. a vector store — practical rule of thumb

- Use **vector search** for: "find anything related to X" style fuzzy semantic queries
- Use a **graph** for: multi-hop relational queries ("who introduced whom," "what led to what") and anything requiring precise, structured relationship traversal
- Production systems (Mem0^g, Zep) typically use **both together** — vector search for broad semantic recall, graph traversal for precise relational questions, combined at retrieval time (this is exactly what Module 7 covers)

### Hands-on exercise
1. Take the 10 facts you extracted in Module 4's exercise, run the graph extraction prompt above on the original conversation, build the resulting graph in NetworkX.
2. Write 3 queries that are naturally graph queries (relational) and 3 that are naturally vector queries (semantic fuzzy) — notice how differently you'd have to phrase code to answer each.

### Checkpoint questions
- Give a query where a pure vector store would give a wrong or incomplete answer but a graph would get it right.
- Why does a temporal graph need to store both an old and new fact, rather than just overwriting?

---

# MODULE 7 — Hybrid Retrieval

### The three signals, and why you need all of them

**Semantic (vector) search** catches meaning-based matches even with no shared vocabulary, but can miss exact terms — e.g., if a user asks about "invoice #4471," a pure embedding search might retrieve semantically-similar-sounding invoices instead of the exact one, because embeddings blur precise identifiers.

**Keyword search (BM25)** is the classical statistical text-matching algorithm (a refinement of TF-IDF) that scores documents based on exact term overlap, weighted by how rare/informative each term is. This is exactly what catches "invoice #4471" reliably — exact strings, numbers, codes, names.

**Entity/graph matching** boosts results that are connected, in the graph, to entities mentioned in the query — catching relational relevance that neither of the above two directly captures.

### BM25 in code

```python
from rank_bm25 import BM25Okapi

documents = [
    "User's invoice number is 4471, paid in full",
    "User's favorite color is blue",
    "User mentioned an allergy to peanuts",
]
tokenized_docs = [doc.lower().split() for doc in documents]
bm25 = BM25Okapi(tokenized_docs)

query = "invoice 4471".lower().split()
scores = bm25.get_scores(query)
print(scores)  # the invoice doc should score highest
```

### Fusing scores from multiple signals

A simple, practical fusion approach — normalize each signal's scores to 0-1, then combine with weights:

```python
def normalize(scores):
    scores = np.array(scores)
    if scores.max() == scores.min():
        return np.zeros_like(scores)
    return (scores - scores.min()) / (scores.max() - scores.min())

def hybrid_score(semantic_scores, bm25_scores, weight_semantic=0.6, weight_bm25=0.4):
    sem_norm = normalize(semantic_scores)
    bm25_norm = normalize(bm25_scores)
    return weight_semantic * sem_norm + weight_bm25 * bm25_norm
```

More sophisticated production systems use **Reciprocal Rank Fusion (RRF)** instead of raw score averaging, since raw scores from different systems (cosine similarity vs. BM25) aren't on comparable scales — RRF instead combines based on each document's *rank* in each system's results, which is more robust.

### Temporal reasoning in retrieval

Beyond just "is this relevant," retrieval needs to weight **when** a memory applies relative to the query's intent:
- Query implies "now" ("what's the user's current employer") → rank the most recent matching fact highest, potentially exclude older contradicting facts entirely
- Query implies history ("what did the user say last month") → rank by closeness to that specific time window, not recency

This requires your extraction pipeline (Module 5/6) to actually timestamp facts and, ideally, track validity ranges (Module 6's temporal graph concept) — retrieval quality on temporal questions is capped by whether your storage layer preserved that information in the first place.

### Hands-on exercise
1. Build a small corpus of 15 facts including at least 3 with exact identifiers (numbers, codes, names) and run the same query through pure semantic search vs. pure BM25 vs. a simple fused combination — find a query where fusion clearly wins over either alone.
2. Add timestamps to your facts, write a query that should prefer the most recent fact, and verify your fusion function (extended with a recency-boost term) actually surfaces the newest one first.

### Checkpoint questions
- Give a concrete query where BM25 beats semantic search, and one where semantic search beats BM25.
- Why is raw score averaging across systems potentially unreliable, and what does RRF fix?

---

# MODULE 8 — Protocols & Integration

### MCP (Model Context Protocol) — what problem it solves

Before MCP, every agent framework (LangChain, CrewAI, custom code) needed its own bespoke integration code to talk to any given tool or memory backend — a combinatorial mess of N frameworks × M tools needing custom glue each time. MCP standardizes this: any MCP-compatible client can call any MCP-compatible server's tools through one consistent protocol, so your memory service only needs to implement the protocol once to be usable everywhere.

### A minimal MCP server exposing memory tools (conceptual structure)

```python
# Simplified illustration of MCP server structure — consult the official 
# MCP SDK docs (modelcontextprotocol.io) for the exact current API, 
# since this evolves; the shape below is the stable conceptual pattern.

from mcp.server import Server
import chromadb

app = Server("memory-service")
chroma_client = chromadb.Client()
collection = chroma_client.create_collection(name="mcp_memory")

@app.tool()
def remember(fact: str, user_id: str) -> str:
    """Store a new fact for a given user."""
    fact_id = f"{user_id}_{collection.count()}"
    collection.add(documents=[fact], ids=[fact_id], metadatas=[{"user_id": user_id}])
    return f"Stored: {fact}"

@app.tool()
def recall(query: str, user_id: str, k: int = 3) -> list:
    """Retrieve relevant facts for a given user."""
    results = collection.query(
        query_texts=[query], n_results=k,
        where={"user_id": user_id}  # multi-tenancy filter
    )
    return results['documents'][0]
```

Note the `where={"user_id": user_id}` filter — this is your multi-tenancy boundary. Any query, no matter how it's phrased, is scoped so it can never retrieve another user's facts. This single line is the difference between a safe multi-tenant memory service and a serious data leak.

### Multi-tenancy — designing the isolation properly

At minimum, every stored memory needs a tenant/user identifier attached as metadata, and **every single retrieval call must filter by it** — never rely on "the query probably won't match another user's data" as your isolation strategy; that's not isolation, that's hoping. For stricter isolation (e.g., enterprise customers), consider separate collections/indexes per tenant entirely, rather than a shared index with metadata filtering, since a filtering bug is a much smaller blast radius than a shared-index bug.

### SDK design — what developers actually want

Look at how Mem0's SDK is shaped for inspiration:

```python
from mem0 import Memory
m = Memory()

m.add("User's favorite color is blue", user_id="user123")
results = m.search("what color does the user like", user_id="user123")
```

Three methods. That's it. The lesson: your memory service's *external* API surface should be this minimal, even if the internals (extraction, routing, hybrid retrieval, graph) are complex. Complexity should live inside your service, not leak into every developer's integration code.

### Hands-on exercise
1. Build the minimal MCP server above (or follow the current official SDK quickstart, since the exact API surface evolves) exposing `remember` and `recall`.
2. Connect it to a real MCP client and verify you can store and retrieve a fact through the protocol, not just by calling your Python functions directly.
3. Deliberately try to make user A's query retrieve user B's data — verify your multi-tenancy filter actually blocks this.

### Checkpoint questions
- Why is a 2-3 method SDK surface better than an SDK exposing 15 configuration options up front?
- What's the actual failure mode of relying on "the semantic query probably won't match" as your only tenant isolation?

---

# MODULE 9 — Studying Production Systems

### Mem0 — architecture in depth

Mem0's core loop: extract facts from conversation → for each new fact, retrieve top-k similar existing memories → an LLM routing call decides ADD/UPDATE/DELETE/NOOP → store the result in a vector index (and optionally a graph, in the Mem0^g variant, which additionally runs entity/relationship extraction and stores in Neo4j alongside the vector store). This is literally the pattern you built by hand in Modules 5-6 — Mem0 productionizes it with production concerns handled: multi-tenancy, hosted infra, SDKs for a dozen+ frameworks, and an optimized routing algorithm (their 2026 update moved to single-pass hierarchical extraction to cut token cost significantly versus their original 2025 approach).

### Zep / Graphiti — architecture in depth

Zep leans graph-first rather than vector-first: it builds a temporal knowledge graph as its primary structure (Module 6's temporal graph concept, productionized), with vector search as a secondary signal layered on top for semantic fallback. Its pitch is specifically strong performance on complex temporal reasoning benchmarks (LongMemEval) — questions like "what changed between these two points in time" are graph-native questions Zep is built to answer well.

### Letta (formerly MemGPT) — architecture in depth

Letta's foundational idea is the OS-memory-paging analogy from Module 4: the LLM's context window is treated like RAM (fast, limited, volatile), and long-term storage is treated like a disk (slower, persistent, effectively unlimited). The agent itself is given explicit tools to "page" information in and out — deciding what to keep in its working context versus what to write out to long-term storage, rather than this being entirely handled by an external routing system.

### Cognee — architecture in depth

Cognee's whole pitch is minimal-setup, local-first operation — install via pip, provide an LLM API key, and you have working persistent memory with no external database infrastructure required by default. Its API is deliberately reduced to four verbs: `remember`, `recall`, `forget`, `improve` — a close cousin of the ADD/UPDATE/DELETE/NOOP pattern, just renamed for clarity, with "improve" covering ongoing refinement/consolidation of stored memories over time.

### Supermemory — architecture in depth

Supermemory positions itself specifically around MCP-native integration and coding-agent workflows (Claude Code, Cursor, OpenCode plugins) — its differentiation isn't a fundamentally different storage architecture, but tight, frictionless integration into the specific tools developers already use daily, plus benchmark claims (self-reported, not yet independently verified as of the most recent data) on LongMemEval, LoCoMo, and ConvoMem.

### Hands-on exercise — the real comparison

```python
# Mem0 hands-on
from mem0 import Memory
m = Memory()
m.add("User is allergic to peanuts", user_id="test_user")
m.add("User's allergy is actually to tree nuts, not peanuts", user_id="test_user")
print(m.search("what allergy does the user have", user_id="test_user"))
# Check: did it correctly UPDATE rather than storing both contradicting facts?
```

```python
# Cognee hands-on (API shape illustrative — check current docs for exact calls)
import cognee
await cognee.add("User is allergic to peanuts")
await cognee.add("User's allergy is actually to tree nuts, not peanuts")
results = await cognee.search("what allergy does the user have")
print(results)
```

Run both, on the same contradiction scenario, and write down: did each system correctly resolve the contradiction? How fast was each? How much setup did each require?

### Checkpoint questions
- Which system would you reach for if you needed strong temporal reasoning specifically, and why?
- Which system's API design do you personally find cleanest, and what does that tell you about SDK design priorities for your own product?

---

# MODULE 10 — Advanced & Unsolved Problems

### Memory staleness — the hard version of the decay problem

Simple decay (down-weighting old, rarely-retrieved memories over time) is a solved, well-understood problem. The **hard** version is: a memory that is *frequently retrieved* and *was accurate* becomes silently wrong — e.g., "user's employer is Acme Corp" gets retrieved constantly because it's relevant to many queries, but the user changed jobs two months ago and never explicitly told the agent. Frequency-based relevance scoring will actually make this *worse* over time (the wrong fact gets reinforced by being retrieved often), not better. There's no fully solved general answer here — practical mitigations include periodically re-confirming high-frequency facts with the user, or tagging facts with a "last confirmed" date and treating anything past a threshold as lower-confidence.

### Cross-session identity resolution

The entire memory system assumes you know that "this session" belongs to the same person as "that earlier session." In practice: anonymous/logged-out sessions, users on multiple devices, shared accounts, and B2B scenarios with multiple people using one account all break this assumption. There's no general solved answer — this is treated as an open problem at the memory layer itself, meaning most systems punt it upstream to whatever authentication layer sits above them, and simply trust whatever `user_id` they're given.

### Contradiction resolution — beyond simple UPDATE

Module 5's routing pattern (ADD/UPDATE/DELETE/NOOP) assumes a clean binary: new fact either replaces old fact, or it doesn't. Real conversations are messier — a user might state something, later say something that's ambiguous about whether it's a correction or an addition, or two different facts might both be "sort of true" depending on context (e.g., "budget is $10k" for one project, "$50k" for another — these aren't actually contradictory, they're both true but scoped differently, and a naive router might incorrectly treat the second as an UPDATE that overwrites the first). Building a good contradiction-resolution policy requires you to actually define, for your specific domain, what scoping/context a fact needs to be considered "the same fact" in the first place — this is genuinely domain-specific work, not something a generic memory library can fully solve for you.

### Multi-agent shared memory

When multiple distinct agents (say, a data-collecting agent, a review agent, a customer-facing agent) need to operate off one shared memory substrate, new problems appear that don't exist in single-agent memory: which agent's writes are authoritative if two agents write conflicting facts near-simultaneously, whether all agents should see all memories or only a filtered subset relevant to their role, and how you audit which agent wrote (or acted on) which memory when something goes wrong. This is squarely where your vertical-specific product work lives — a generic memory library gives you the storage/retrieval primitives, but the multi-agent authority and access-control policy is something you design for your specific vertical's needs.

### Novelty gating — a practical cost optimization

Instead of running the expensive LLM routing call (Module 5) on every single extracted fact, first do a cheap similarity check: if the new fact's embedding is very far (below some similarity threshold) from every existing memory, it's almost certainly a genuine ADD, and you can skip the LLM call entirely and just add it directly. Only run the expensive routing LLM call when the cheap similarity check finds something close enough to be ambiguous. This can cut routing costs substantially at scale, since most new facts in a long conversation genuinely are new, not corrections.

```python
def should_use_cheap_add(new_fact_embedding, existing_embeddings, threshold=0.3):
    if not existing_embeddings:
        return True
    max_similarity = max(cosine_similarity(new_fact_embedding, e) for e in existing_embeddings)
    return max_similarity < threshold  # far from everything = safe to just ADD directly
```

### Semantic caching

If the same or very similar query gets asked repeatedly (common in production — many users ask semantically similar questions), cache the retrieval result keyed by embedding similarity rather than exact string match, so a slightly-reworded repeat query can still hit the cache and skip a full retrieval + generation cycle.

### Hands-on exercise
1. Implement the novelty-gating function above, run it against a 30-fact synthetic conversation, and measure how many facts skip the expensive routing call versus how many still need it.
2. Design (in writing, for your chosen vertical) a policy for: what "last confirmed" threshold triggers re-confirmation of a high-frequency fact, and what happens if the user doesn't respond to a re-confirmation prompt.

### Checkpoint questions
- Why can frequency-based relevance scoring make the staleness problem worse, not better?
- Describe a real scenario in your vertical where two facts look contradictory to a naive router but are actually both true.

---

# MODULE 11 — Research Paper Deep Dive

### How to actually read these papers (not just skim abstracts)

For each paper below, read for four things specifically: (1) what exact problem are they solving that prior work didn't, (2) what's the core mechanism/algorithm, (3) what benchmark did they use and what were the actual numbers, (4) what's the stated limitation even the authors admit to. This is worth doing on paper — literally write these four things down for each paper before moving to the next.

### Paper 1: Mem0 (arXiv:2504.19413)
- **Problem**: existing memory approaches lack a systematic, benchmarked comparison; also proprietary systems (like a major AI lab's built-in memory feature) underperform specifically on temporal reasoning due to poor timestamp extraction.
- **Mechanism**: the ADD/UPDATE/DELETE/NOOP routing pattern you built in Module 5, plus a graph-extended variant (Mem0^g) using Neo4j for relationship storage.
- **Benchmark**: LoCoMo, compared against ten different memory approaches including full-context, plain RAG, and other named systems.
- **Read the actual numbers** in the paper for latency and token cost reduction versus full-context baseline — this is the paper's central practical claim.

### Paper 2: A-Mem (arXiv:2502.12110)
- **Problem**: existing memory systems (including Mem0-style approaches) use fixed, rigid operations and structures that don't adapt well across different task types.
- **Mechanism**: borrows from the Zettelkasten note-taking method (a system of small, atomic, densely cross-linked notes) — memories dynamically link to related memories, and the organization structure itself evolves as new memories are added, rather than following one fixed schema.
- **Why this matters for your work**: if your vertical has facts that naturally interconnect in complex, evolving ways (rather than fitting a clean ADD/UPDATE/DELETE lifecycle), this paper's approach may be more relevant to you than Mem0's.

### Paper 3: MemEngine (arXiv:2505.02099)
- **Problem**: the field was (and still is) fragmented, with different papers/libraries implementing incompatible memory models, making comparison and reuse hard.
- **Mechanism**: not a new memory algorithm itself — it's a unified library implementing many memory models (from various papers) under one consistent interface, organized in layers (basic functions → memory operations → full memory models).
- **Why this matters**: its comparison table is the single fastest way to see the whole landscape's tradeoffs in one place, rather than reading 10 separate papers.

### Paper 4: "Memory for Autonomous LLM Agents" survey (arXiv:2603.07670)
- Read this as your "catch me up on 2026" paper — surveys covering mechanisms, evaluation methods, and open frontiers give you the vocabulary and map of the field as it currently stands, which is especially useful since this field moves fast enough that any single course (including this one) will be somewhat dated within months.

### Benchmarks explained properly

- **LoCoMo**: tests recall over long, multi-session conversations — the core "does the agent remember" test.
- **LongMemEval**: specifically designed around complex temporal reasoning (multi-hop time-based questions), closer to real enterprise usage patterns than simpler recall tests.
- **DMR (Deep Memory Retrieval)**: the original benchmark introduced alongside MemGPT — an earlier, narrower precursor to the above.
- **ConvoMem**: conversational memory benchmark used prominently by Supermemory's self-reported results.

### Hands-on exercise
1. For each of the 4 papers, write your own 3-sentence summary (problem / mechanism / result) without looking at the paper while writing — this forces you to actually retain the content, not just recognize it.
2. Build a mini-benchmark: write 8-10 test conversations (in your chosen vertical) each containing at least one fact that gets stated, then contradicted, later in the conversation. For each, write down the "expected" fact that should be retrievable at the end. This becomes your evaluation harness for Module 12.

### Checkpoint questions
- Which paper's approach (Mem0's rigid ops vs. A-Mem's evolving links) would you pick as your starting architecture, and why, given your chosen vertical?
- What's one specific limitation each paper admits to, that's directly relevant to a problem you'd face building your product?

---

# MODULE 12 — CAPSTONE: Build Your Vertical Memory Product (MVP)

### Step 1 — Fact schema design (do this on paper/doc first, not code)

For your vertical, fill out this table completely before writing any code:

| Fact type | Example | Expected lifespan | What counts as a contradiction | Authoritative source |
|---|---|---|---|---|
| (fill in) | (fill in) | (fast/slow decay) | (define precisely) | (who/what can override this fact) |

Do this for every fact type that matters in your vertical — aim for 5-10 rows. This table is the actual product IP; everything else in this module is just executing against it.

### Step 2 — Build the pipeline, reusing every module

```python
# Skeleton pulling together Modules 5, 6, 7, 8

def ingest_turn(conversation_turn, user_id):
    # Module 5: extract facts
    facts = extract_facts(conversation_turn)
    
    for fact in facts:
        # Module 5: route against existing memory
        similar = get_similar_facts(fact["fact"], user_id=user_id)
        decision = route_fact(fact["fact"], similar)
        apply_decision(decision, fact, user_id)
        
        # Module 6: also extract into the graph if it's a relational fact
        if is_relational(fact):
            graph_data = extract_graph(fact["fact"])
            add_to_graph(graph_data, user_id)

def retrieve_for_query(query, user_id):
    # Module 7: hybrid retrieval
    semantic_results = vector_search(query, user_id)
    keyword_results = bm25_search(query, user_id)
    graph_results = graph_search(query, user_id)
    return fuse_results(semantic_results, keyword_results, graph_results)
```

Fill in each function using the code you already built in Modules 5-7 — the capstone is integration work, not new concepts.

### Step 3 — Build your evaluation harness

Using the mini-benchmark from Module 11's exercise:

```python
def evaluate(test_cases):
    correct = 0
    for case in test_cases:
        ingest_conversation(case["conversation"], user_id="eval_user")
        result = retrieve_for_query(case["query"], user_id="eval_user")
        if case["expected_fact"] in result:
            correct += 1
    return correct / len(test_cases)

score = evaluate(your_test_cases)
print(f"Retrieval accuracy: {score:.1%}")
```

Track this score as you tune your extraction prompts, routing logic, and retrieval fusion weights — this number is your objective feedback signal for whether changes actually help.

### Step 4 — Dogfood with a real (or realistic toy) agent

Wire your memory pipeline into an actual agent loop (even a simple LangChain agent) for your vertical, run at least 20 real or realistic conversations through it, and manually inspect every case where retrieval returned something wrong, stale, or missing. Update your fact schema (Step 1) based on real failures — this iteration loop, not the initial design, is where the product actually gets good.

### Checkpoint — capstone completion criteria
- [ ] Written fact schema table for your vertical
- [ ] End-to-end pipeline: ingestion → extraction → routing → storage (vector + graph) → hybrid retrieval
- [ ] Working evaluation harness with a measured accuracy score
- [ ] At least one full iteration cycle: ran real conversations, found failures, updated schema/logic, re-measured

---

# MODULE 13 — Business Layer

### Pricing models, compared

- **Per-operation (pay-per-call)**: e.g., $0.001 per store, $0.001 per recall — simple, scales naturally with usage, easy for developers to reason about cost, but can feel expensive at high volume without volume discounts.
- **Subscription tiers**: fixed monthly price for a usage band (e.g., up to N memory operations) — predictable revenue for you, predictable cost for customers, but requires you to actually model your own infrastructure cost per operation accurately to avoid pricing yourself into a loss on heavy users.
- **Token/usage-based**: pricing tied to underlying LLM token consumption (since extraction and routing calls are your actual variable cost) — most accurately reflects your true costs, but is harder for customers to predict/budget against.

### Developer experience as a genuine competitive moat

The friction in your signup → first successful API call flow is often a bigger factor in developer adoption than your actual retrieval quality, especially early on when developers are just evaluating whether to try you at all. The bar being set in this space is instant, frictionless provisioning — no email verification loop, no dashboard clicking, a working API key in seconds. Match or beat this bar, or developers will bounce before ever testing your actual differentiation.

### Integration surface — minimum viable set

Prioritize, in order: (1) a raw REST API (works for literally anyone, any language), (2) an MCP server (works with Claude Code, Cursor, and the growing MCP ecosystem with zero custom integration), (3) SDKs for the 2-3 most popular agent frameworks in your specific vertical (not all frameworks — the ones your actual target customers use).

### Positioning against generalist players

Your pitch should never be "we also do memory" — that's a losing frame against an established generalist. Instead: "we solve [specific, named failure mode] for [specific vertical] agents, because we understand [specific domain fact type / decay pattern / contradiction rule] that generic memory tools treat as one-size-fits-all." Back this with your Module 12 evaluation harness — a measured accuracy number on your vertical-specific benchmark is a far stronger sales argument than a generic claim of "better memory."

### Hands-on exercise
1. Write your positioning statement in exactly 2-3 sentences, naming the specific failure mode you solve and the specific vertical.
2. Sketch a pricing table with at least 2 tiers, and calculate your actual per-operation cost (LLM API cost for extraction + routing + your infra cost) to sanity-check that your proposed pricing has real margin.
3. List, in priority order, the first 3 integrations (REST API always first) you'd build, and justify the order based on where your actual target users already work.

### Checkpoint questions
- What's the one sentence you'd say to a potential first customer that a generalist memory tool's sales team could never credibly say?
- If your per-operation cost came out higher than your planned price point, what would you change first — the pricing, the routing algorithm's cost, or the vertical?

---

# Course Completion Checklist
- [ ] Module 1: Watched an LLM forget, measured token cost growth firsthand
- [ ] Module 2: Built working embedding comparisons and a local vector store
- [ ] Module 3: Built full manual RAG pipeline with re-ranking
- [ ] Module 4: Classified real conversation facts into three memory types
- [ ] Module 5: Built working fact extraction + ADD/UPDATE/DELETE/NOOP routing
- [ ] Module 6: Built entity/relationship extraction into a working graph
- [ ] Module 7: Built hybrid (semantic + BM25) retrieval with fusion
- [ ] Module 8: Built a working MCP server with multi-tenancy
- [ ] Module 9: Hands-on tested Mem0 and Cognee on the same contradiction scenario
- [ ] Module 10: Implemented novelty gating, wrote a staleness policy
- [ ] Module 11: Summarized 4 core papers, built your evaluation mini-benchmark
- [ ] Module 12: Full working vertical-tuned MVP with measured accuracy
- [ ] Module 13: Written positioning statement and sanity-checked pricing