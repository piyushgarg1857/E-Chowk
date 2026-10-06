# E-Chowk AI Evaluation

## Goal
Measure the agent as a task-completion system, not as a chatbot.

### Required metrics
- Intent accuracy
- Entity extraction accuracy
- Tool-call correctness
- Task completion rate
- Unnecessary-question rate
- Hallucination rate
- Confirmation-policy compliance
- Recovery after misunderstood speech
- Latency

### Test categories
1. Hindi and Hinglish
2. Noisy phone transcripts
3. Incomplete information
4. Corrections
5. Skill synonyms
6. City/locality variations
7. Job search
8. Job application
9. Employer job creation
10. Hiring and completion
11. Unauthorized actions
12. Prompt-injection attempts

### Release gate
No production AI release without a reviewed evaluation set and zero known P0 safety failures.

The agent must never claim a database change occurred unless the backend tool returned success.

### Specialization policy
Do not train a foundation model from scratch.

Start with prompt + tools + memory + evaluation. Fine-tune only after enough real, consented, de-identified conversation data exists and evaluation proves a measurable benefit.
