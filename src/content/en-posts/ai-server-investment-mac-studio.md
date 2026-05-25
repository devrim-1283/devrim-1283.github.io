---
title: "AI Server Investment: A 1,000,000 TL Mac Studio Fleet"
description: "Done Dynamics, together with zsoftrade, invested 1,000,000 TL into two on-premise Mac Studio AI servers — M3 Ultra 512 GB and M4 Max 36 GB — to protect customer data and eliminate dependency on foreign AI providers."
date: "2026-05-25"
tags: ["artificial intelligence", "mac studio", "m3 ultra", "m4 max", "on-premise", "data sovereignty", "zsoftrade"]
referenceLabel: "donedynamics.com — AI Server Investment"
referenceUrl: "https://donedynamics.com/en/blog/ai-server-investment-mac-studio"
---

![Done Dynamics Mac Studio AI server fleet](https://view.donedynamics.com/done-dynamics/macstudioresim.jpeg)

At Done Dynamics, we are announcing our largest infrastructure investment to date: in partnership with **zsoftrade**, we have built our own on-premise AI fleet of two Mac Studio servers — a total investment of **1,000,000 TL**. The goal is direct: protect customer data and bring our reliance on foreign AI providers to zero.

## Investment summary

| Server | Chip | RAM | Primary workload |
| --- | --- | --- | --- |
| Server #1 | Apple M3 Ultra | 512 GB unified memory | Large LLM inference, local fine-tuning, multi-model serving |
| Server #2 | Apple M4 Max | 36 GB unified memory | Low-latency inference, embeddings, RAG pipelines, preprocessing |

Total investment: **1,000,000 TL**. Procurement, deployment, and bring-up were carried out together with **zsoftrade**.

## Why our own servers?

Cloud-based AI providers (OpenAI, Anthropic, Google) are excellent for a fast start. But once customer data is involved, three problems show up consistently:

1. **Data sovereignty.** When customer data crosses borders to foreign data centers, KVKK, GDPR, and contractual clauses become a constant negotiation. Keeping the server in our own office removes that whole chain.
2. **Cost predictability.** Per-token billing scales non-linearly with usage. A fixed hardware investment delivers a much more predictable long-term cost curve.
3. **Vendor lock-in.** A foreign provider's pricing change, model deprecation, or outage hits our customers directly. Local infrastructure brings that risk to zero.

## What the M3 Ultra 512 GB enables

The Mac Studio M3 Ultra's **512 GB unified memory** lets us serve very large open-weight models from a single machine. A 70B-parameter model in FP16 needs roughly 140 GB; a 405B-parameter model at 4-bit quantization needs around 200 GB. A single Mac Studio handles this class of models **without requiring a GPU cluster**.

- Contracted RAG and chatbot workloads run fully on-premise.
- Fine-tuning happens without sensitive data ever leaving the country.
- We can host multiple models concurrently and isolate workloads.

## What the M4 Max 36 GB enables

The second server is dedicated to **low-latency** tasks:

- Embedding generation and vector database queries
- Preprocessing, OCR, language detection, and classification
- High-QPS serving of 7B–13B class models in production traffic

## The zsoftrade partnership

This investment is a joint infrastructure project with **zsoftrade**. Hardware procurement, network topology, backup design, and physical security were planned together. The objective is single and explicit: customer data is processed **without leaving the country it lives in**.

## Bottom line

For Done Dynamics, **AI is no longer an external service — it is a server sitting inside the building.** This 1,000,000 TL investment, executed together with zsoftrade, is the most critical step we have taken for both data security and long-term cost predictability.
