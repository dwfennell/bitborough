# Game Design Principles
*Key insights from Raph Koster's "Game design is simple, actually"*

## The Twelve-Step Framework for Game Design

### 1. Fun is About Mastery of Problems
- **Core Definition**: Fun = making progress on prediction
- Fun isn't the confetti or surface-level rewards—it's about problem-solving
- Fun often shows up *after* an activity, not necessarily during it
- Anything not about problem-solving isn't core to game systems design (though it can enhance experience)
- Example: Free climbing a cliff can be "fun" even if terrifying because you're mastering a problem

### 2. Problems and Toys
- **Problems** are built from constraints (rules) + goals
- **Toys** are systems with constraints but no explicit goal
- A toy is a "problematic object, a problem that invites you to play with it"
- Building toys is hard but excellent for starting game design
- Players routinely turn toys into games by inventing their own goals
- **Key Insight**: We play with systems that have constraints and movement, and we stick goals on them to test ourselves

### 3. Prediction and Uncertainty
- Games are machines built around uncertainty
- Good games stay unpredictable as long as possible
- When a game becomes predictable, it stops being fun (it becomes "solved")
- **Puzzles vs Games**: Puzzles have one answer (binary); games maintain uncertainty

**Good problems for games have:**
- Answers that evolve as you dig deeper (depth)
- Uncertain answers
- The ability to appear in many situations

**Examples**:
- Tic-tac-toe becomes a puzzle once you're old enough to solve it
- Pac-Man got "solved," which is why Ms. Pac-Man was created (added randomness)

**Bottom Line**: The more uncertainty, indeterminacy, and ambiguity in your game, the more depth it will have

### 4. Loops
- **Operational Loop**: How you interact with the problem (observe → hypothesize → test → see result → update hypothesis)
- **Progression Loop** (better: spiral): Repeating the core verb against varied situations, spiraling toward mastery
- Every game needs something pushing back against the player—an opponent (even if it's just physics)
- The verbs stay the same, but situations change
- Think of it as: one machine (mechanics), many situations

**Bottom Line**: Players need to understand how to use the machine, and the point is to gradually infer how it works by testing it against varied situations

### 5. Feedback
Players need information to learn:
1. What actions (verbs) are available
2. Confirmation that you used a verb
3. How the verb affected the problem state
4. Whether the change was good or bad for your goal

**Terms to know**: affordance, juice, state space, perfect information

**Three feedback mistakes:**
- Too little → players can't learn (invisible Tetris pieces)
- Bad feedback → players can't draw conclusions (random Tetris scoring)
- Great feedback masking shallow problems → exploitative entertainment

**Important**: People will engage with simple, familiar problems if the feedback is great—but this can be manipulative

**Bottom Line**: Show what you can do, that you did it, what difference it made, and whether it helped

### 6. Variation and Escalation
- **System Design vs Content**: "How to multiply numbers" is a problem; "What is 6 x 9" is content
- Don't design specific scenarios—design systems that generate scenarios
- Core mechanics should work across many situations
- Good verbs confront many different situations
- Escalate complexity so players can test, refine, and abandon theories
- Early solutions should eventually stop working
- Use randomness as a classic way to create variation (Ms. Pac-Man approach)

**Bottom Line**: Escalate situations so theories can be tested, refined, and abandoned

### 7. Pacing and Balance
Learn from educational theory and training science:
- People learn best through iterative practice (loops!)
- Optimal challenge: right past the edge of what they can do
  - Too far beyond → they can't even see the problem
  - Too easy → boredom or grinding without progression
- **Pacing shape**: Rising sine wave (tension curve)
  - Start slow → speed up → peak challenge → breather (not all the way down) → repeat
- Allow different paces (difficulty sliders)
- Not everyone will reach the top—that's okay
- Leave room for non-mastery activities (social fun, exploration)

**Bottom Line**: Vary intensity and pressure, give players a chance to practice and moments to be tested

### 8. Games are Made of Games
- Games nest fractally
- Almost no games have only one loop
- Loops chain together: Loop A outputs something that constrains/enables Loop B
- **Value Chains**: Linear progression of loops
- **Game Economies**: Non-linear webs of interconnected loops
  - Not about money—about stocks, flows, system dynamics
  - Example: Hit points are a "currency" you spend in fights
- Complex movements decompose into simpler problems (running + jumping + spatial orientation = 3D movement)

**Example**: Clicking a stick = rail shooter = FPS (different dressing, similar core problem)

**Bottom Line**: Build small problems into larger webs, and map them so you understand how they connect

### 9. Actual Systems Design
The hard part: designing the problems themselves

**Three broad problem categories:**
1. Mathematically complex puzzles
2. Figuring out how other humans think
3. Mastering your body and brain

These break into many sub-problems, often disguised:
- Ball trajectory = fuel consumption = poison damage over time (all the same calculus problem)

**Where to find problems:**
- Steal from other games
- Steal from real-world systems
- Build your catalog and workbench

**Important**: The diversity of problems you pose affects who wants to play your game

**Bottom Line**: Not every mechanic has been invented, but a ton have. Build your catalog and workbench

### 10. Dressing and Experience
The feedback layer = everything about presentation:
- Setting, lore, audio, story, art, UI
- How you dress problems changes how players learn and perceive them
- Same problem can be: picking up sticks, shooting enemies, or solving calculus
- This is the realm of metaphor, painting, poetry, music, rhetoric, storytelling

**Key Distinctions:**
- Are you telling the player a story, or enabling them to tell stories with your game?
- It's easy to create experiences that clash with underlying problems
- Experience design and systems design are synergistic but NOT the same thing
- Games isn't the best place to learn these arts—go study painting, film, music, writing

**You need both**: Interesting problems AND compelling experience to make great games

**Bottom Line**: Game development is a compound art form. Learn the individual arts AND the part unique to games

### 11. Motivations (Psychographics)
- Not everyone likes the same problems or presentations
- Motivations = personal taste for:
  - Groups of problems
  - How problems are presented
  - Characteristics and contexts of problems
- Influenced by: personality, social dynamics, upbringing, culture, trauma, mood
- Problems must be: not obvious to you, not baffling to you, AND interesting to you

**Design Approach:**
1. Start with player motivations
2. Map to problem types
3. Map to experience types
4. Map to demographics
5. Find lists of problems for each motivation category

**Motivations ≠ Fun**: They're a filter, useful for marketing and defining game pillars

**Bottom Line**: No game is for everyone, so you'll make better games if you know who you're posing problems for

### 12. It's Simple, But Not
- Each of the 11 topics is deep enough to be multiple fields of study
- Understanding all 11 is more valuable than expertise in just one
- Getting any one wrong can break your game
- All the best practices are written down—but it's a lot to learn
- Each paragraph in this framework could be (and often is) a book

**Why designers fail often:**
- Players learn along with designers
- Making the same game → players get bored (solved problems)
- Making it too complex → dissolves into noise, nobody plays
- **The sweet spot**: Right outside the edge of what designers know how to do

**Bottom Line**: Each topic is deep, but you want a smattering of all of them

---

## Quick Reference: The Bottom Lines

1. **Fun** = making progress on prediction
2. **Toys** = we play with systems that have constraints and movement, stick goals on them to test ourselves
3. **Uncertainty** = the more uncertainty/indeterminacy/ambiguity, the more depth
4. **Loops** = players gradually infer how the machine works by testing against varied situations
5. **Feedback** = show what you can do, that you did it, what difference it made, whether it helped
6. **Variation** = escalate situations so theories can be tested, refined, and abandoned
7. **Pacing** = vary intensity and pressure, give practice and testing moments
8. **Composition** = build small problems into larger webs, map how they connect
9. **Systems** = build your catalog and workbench of existing mechanics
10. **Dressing** = learn individual arts AND the part unique to games
11. **Motivations** = know who you're posing problems for
12. **Depth** = each topic is deep, get a smattering of all

---

## Key Warnings

- **Don't confuse feedback with depth**: Great feedback can mask shallow problems (exploitative design)
- **Avoid solved games**: When players figure out the optimal strategy, fun dies
- **Design systems, not scenarios**: "How to multiply" is a problem; "6 x 9" is content
- **Start with toys**: Building toys is an excellent entry point to game design
- **Players are co-designers**: They routinely invent their own goals and turn experiences into games

---

## Core Philosophy

> "When the game of making games is played right, it is always right outside the edge of what the designers know how to do. That's where the fun lives, not just for the designer, but also for their audience."

The entire discipline reduces to: **pose interesting problems, provide clear feedback, ensure uncertainty persists as long as possible, and escalate complexity as players master simpler solutions.**

---

*Source: Raph Koster, "Game design is simple, actually" (November 3, 2025)*
*[https://www.raphkoster.com/2025/11/03/game-design-is-simple-actually/](https://www.raphkoster.com/2025/11/03/game-design-is-simple-actually/)*
