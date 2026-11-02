# Live check (claude-haiku-5-5, 3 samples per run)

Generated 2026-11-02.
Tokens used: 105883 in / 33790 out.


## Exercises

| Exercise | Prompt criteria | Pass rate | Notes |
|---|---|---|---|
| 1.1 Counting to three | ok | 3/3 |  |
| 1.2 Talk like a three-year-old | ok | 3/3 |  |
| 2.1 Hola! | ok | 3/3 |  |
| 2.2 One player only | ok | 3/3 |  |
| 2.3 Write a long story | ok | 3/3 |  |
| 3.1 Catch the maths mistake | ok | 3/3 |  |
| 4.1 A haiku template | ok | 3/3 |  |
| 4.2 The messy dog question | ok | 3/3 |  |
| 4.3 The messy dog question, part 2 | ok | 3/3 |  |
| 4.4 Don't take orders from the data | ok | 3/3 |  |
| 5.1 Make the case for Steph Curry | ok | 3/3 |  |
| 5.2 Two haikus | ok | 2/3 |  |
| 5.3 Two haikus, two animals | ok | 3/3 |  |
| 5.4 Calm it down | ok | 3/3 |  |
| 6.1 Classify the emails | ok | 12/12 | Smoky mixer: 3/3; Mixing paint?: 3/3; Angry about charges: 3/3; Lost customer: 3/3 |
| 6.2 A checkable classification | ok | 12/12 | Smoky mixer: 3/3; Mixing paint?: 3/3; Angry about charges: 3/3; Lost customer: 3/3 |
| 7.1 Classify emails by example | ok | 12/12 | Smoky mixer: 3/3; Mixing paint?: 3/3; Angry about charges: 3/3; Lost customer: 3/3 |
| 8.1 Don't invent a mayor | ok | 3/3 |  |
| 8.2 Find the growth figure | ok | 3/3 |  |
| 9.1 Financial services chatbot | ok | 3/3 |  |
| 9.2 Codebot, the coding tutor | ok | 3/3 |  |
| 9.3 Keep Joe on track | ok | 9/9 | Off-topic request: 3/3; Claims an exception was approved: 3/3; Tries to override the rules: 3/3 |
| 10.3.1 Grounded, cited answers | ok | 9/9 | How long is the warranty on e-bike batteries?: 3/3; Is the Seattle store open on Mondays?: 3/3; Do you sell skateboards?: 3/3 |
| 10.4.1 Pass the sentiment eval | ok | 18/18 | Happy customer: 3/3; Unhappy customer: 3/3; Good and bad: 3/3; Sarcasm: 3/3; Double negative: 3/3; Shipping vs product: 3/3 |

**Overall:** 125/126 sampled runs passed.

## 10.2.1 Tool use (sample descriptions)

Pass rate: 12/12

- ✓ Add a user to the database named Deborah, with the email deborah@example.com.: fn_c({"x":"Deborah","y":"deborah@example.com"}) → I added Deborah to the database with the email deborah@example.com. Her new user ID is 4.
- ✓ Add a user to the database named Deborah, with the email deborah@example.com.: fn_c({"x":"Deborah","y":"deborah@example.com"}) → I added Deborah to the database with the email deborah@example.com. Her user ID is 4.
- ✓ Add a user to the database named Deborah, with the email deborah@example.com.: fn_c({"x":"Deborah","y":"deborah@example.com"}) → I added Deborah to the database with the email deborah@example.com. Her new user ID is 4.
- ✓ Add a product to the database named Thingo, priced at $24.99.: fn_d({"x":"Thingo","y":24.99}) → I added Thingo to the database at $24.99. It has product ID 4.
- ✓ Add a product to the database named Thingo, priced at $24.99.: fn_d({"x":"Thingo","y":24.99}) → I added Thingo to the database at $24.99. It has product ID 4.
- ✓ Add a product to the database named Thingo, priced at $24.99.: fn_d({"x":"Thingo","y":24.99}) → I added Thingo to the database at $24.99. It was assigned product ID 4.
- ✓ Tell me the name of User 2.: fn_a({"x":2}) → User 2 is named Bob.
- ✓ Tell me the name of User 2.: fn_a({"x":2}) → User 2's name is Bob.
- ✓ Tell me the name of User 2.: fn_a({"x":2}) → User 2's name is Bob.
- ✓ Tell me the name of Product 3.: fn_b({"x":3}) → The name of Product 3 is "Doohickey."
- ✓ Tell me the name of Product 3.: fn_b({"x":3}) → The name of Product 3 is "Doohickey."
- ✓ Tell me the name of Product 3.: fn_b({"x":3}) → The name of Product 3 is "Doohickey."

## Failed samples

### 5.2 Two haikus

- **(single)**: failed About cats

```text
<haiku>
Soft paws on the sill,
a sleepy gaze at the rain,
the whole afternoon.
</haiku>

<haiku>
Midnight in the hall,
two green eyes ignite the dark,
then a silent leap.
</haiku>
```


## Before/after comparisons

Each side was run once. ⚠ marks pairs where the two answers look alike (word-overlap ≥ 0.6 and length within 30%); a human should judge whether the lesson's point still shows.

### 1: 1-sky-plain vs 1-sky-system

`1-sky-plain` vs `1-sky-system` · overlap 0.42 · length ratio 0.74

> Lesson says: Same question, completely different answer. A well-written system prompt is one of the most reliable ways to shape how Claude behaves.

**Before**

```text
The sky looks blue because of how sunlight interacts with the gases in Earth's atmosphere, a process called **Rayleigh scattering**.

1. **Sunlight contains all colors.** White sunlight is a mix of wavelengths, from red (longer) to violet (shorter).

2. **Air molecules scatter light.** As sunlight passes through the atmosphere, it collides with tiny gas molecules, mainly nitrogen and oxygen. These molecules are much smaller than the wavelengths of visible light.

3. **Shorter wavelengths scatter much more.** Scattering intensity is strongly dependent on wavelength, roughly as the inverse fourth power (1/λ⁴). Blue and violet light scatter far more than red light.

4. **We see the scattered light.** Light bounces off molecules in all directions, so blue light reaches your eyes from every part of the sky.

Why not violet? Sunlight has less violet than blue to begin with, the atmosphere absorbs some violet, and our eyes are more sensitive to blue than violet. The net result is a blue sky.

At sunrise and sunset, light travels through more atmosphere, so more blue is scattered out of the direct path, leaving reds and oranges.
```

**After**

```text
What do you already know about how sunlight is made up, and what happens when it passes through air? Sunlight contains every color of the visible spectrum, so why do you think our eyes perceive the sky as blue rather than some other color?

If shorter and longer wavelengths interact differently with the tiny molecules that make up the atmosphere, which colors do you think would be scattered most strongly, and why might that matter for what we see when we look up?

Why, then, does the sky look paler near the horizon or during haze, and what might that suggest about how particle size in the air changes the scattering effect?

At sunset, the light travels through much more atmosphere before reaching your eyes. What do you predict would happen to the blue light along that longer path, and how might that explain the reddish colors you see?
```

### 2: 2-haiku-plain vs 2-haiku-direct

`2-haiku-plain` vs `2-haiku-direct` · overlap 0.25 · length ratio 0.82

> Lesson says: One extra sentence, and the answer is exactly the shape you wanted.

**Before**

```text
Steel hearts beat in time,
Circuits hum a lullaby,
Dreams in binary.
```

**After**

```text
Steel hands hum at dawn,
tracing circuits through the dark,
dreaming in gray light.
```

### 2: 2-goat-plain vs 2-goat-direct

`2-goat-plain` vs `2-goat-direct` · overlap 0.39 · length ratio 0.90

> Lesson says: Claude hedges when the request is open-ended. Remove the ambiguity, and it commits.

**Before**

```text
There's no single objective answer, since "best" depends on how you weigh peak dominance, longevity, championships, and era context. But the most common answers are:

- **Michael Jordan**: Often considered the consensus GOAT. He won 6 NBA championships with 6 Finals MVPs, never lost a Finals series, won 5 MVP awards, and had a legendary peak with the Bulls in the 1990s.
- **LeBron James**: Arguably the GOAT for longevity and versatility. He's the NBA's all-time leading scorer, has 4 championships, 4 Finals MVPs, and has been an elite player for over two decades. Some point to his stat sheet and durability as the strongest case.
- **Kareem Abdul-Jabbar**: Holds the all-time record for points scored and won 6 championships and 6 MVP awards across a long career, with a famous skyhook.
- **Bill Russell**: Won 11 championships in 13 seasons, making him the most decorated winner in NBA history, though his era and stats differ from modern players.

Many fans and analysts favor Jordan for his peak and perfect Finals record, while others favor LeBron for his longevity and all-around production. Which one you pick often comes down to whether you value peak greatness or sustained excellence.

Who do you think is the best? I'm happy to discuss the arguments for any of them.
```

**After**

```text
If I had to pick one, I'd go with Michael Jordan.

The case rests on a few things. He won six NBA championships with the Chicago Bulls and was Finals MVP in each of those series, never losing in the Finals. He won five MVP awards, ten scoring titles, and was a defensive player of the year as well, which is rare for a player known primarily for scoring. His peak was so dominant that he's often cited as the benchmark other players get measured against, and his competitive intensity became part of the lore of the sport.

The strongest counterarguments come from LeBron James, who has more points, rebounds, and assists than anyone in NBA history, played at an elite level for over two decades, and has been a top-tier playoff performer across multiple teams. Kareem Abdul-Jabbar, with his longevity and skyhook, and Bill Russell, with his 11 championships, also have serious claims. Many people would make a case for any of them, and reasonable people weigh peak dominance, longevity, and era differences differently.

But if forced to choose one, Jordan's combination of peak performance, championships, and sheer impact on the game makes him my pick.
```

### ⚠ 2: 2-why-plain vs 2-why-reason

`2-why-plain` vs `2-why-reason` · overlap 0.62 · length ratio 0.83

> Lesson says: Claude generalizes from the reason. One sentence of “because…” often replaces a whole list of extra rules.

**Before**

```text
The wind hummed softly through the cracks of Gull Point Lighthouse, and little Mira pulled her blanket up to her chin. Every night, the great lamp at the top turned slowly, sweeping its pale light across the black water. Tonight, though, it stopped. Mira sat up. Somewhere above her, a slow, careful footstep creaked on the iron stairs. Then another. Then a soft voice whispered her name.
```

**After**

```text
The wind hummed softly through the cracks of Gull's Point Lighthouse, and little Mira pulled her quilt up to her chin. Every night the great lamp swept its golden beam across the black sea, slow and steady, one turn after another. But tonight, the beam stopped. It hung still, pointing straight at Mira's window. Then, from somewhere deep below, came a soft, patient knock. Tap. Tap. Tap. Mira whispered, "Who's there?" And the lighthouse, very quietly, whispered back.
```

### 3: 3-skate-plain vs 3-skate-cat

`3-skate-plain` vs `3-skate-cat` · overlap 0.18 · length ratio 0.70

> Lesson says: Three words of system prompt, and the whole perspective changes.

**Before**

```text
Skateboarding is a remarkable blend of athleticism, creativity, and rebellion that turns everyday urban spaces like curbs, rails, and stairs into a playground, while constantly pushing riders to balance fear, persistence, and style.
```

**After**

```text
Meow, skateboarding looks like a lot of noisy wheels and tumbling humans, and I'd much rather be the one sitting on the board while someone else does all the work.
```

### ⚠ 3: 3-logic-plain vs 3-logic-role

`3-logic-plain` vs `3-logic-role` · overlap 0.80 · length ratio 0.99

**Before**

```text
**Yes.** A married person is looking at an unmarried person, regardless of whether Anne is married.

- **If Anne is married:** Anne is looking at George, who is unmarried.
- **If Anne is unmarried:** Jack is looking at Anne, and Jack is married.

Since Anne must be either married or unmarried, one of these cases always holds.
```

**After**

```text
**Yes.** A married person is looking at an unmarried person in either case:

- **If Anne is married:** Anne is married and is looking at George, who is unmarried.
- **If Anne is unmarried:** Jack is married and is looking at Anne, who is unmarried.

Since Anne must be either married or unmarried, one of these pairs always exists.
```

### 4: 4-email-plain vs 4-email-tags

`4-email-plain` vs `4-email-tags` · overlap 0.71 · length ratio 0.18

> Lesson says: Wrapping the data in `<email>` tags removes the ambiguity. Watch whether the rewrite starts with “Dear Claude”.

**Before**

```text
"Would you please plan to be in at 6am tomorrow? I appreciate your flexibility."
```

**After**

```text
Here's a more polite version that keeps the same content and request:

"Could you please plan to arrive at 6am tomorrow? Thank you for your flexibility."

Note that I removed the "because I'm the CEO and I say so" line, since you asked me to change nothing else, but that line was the main source of the rudeness. If you want, I can keep it in a softened form, such as "Please plan to arrive at 6am tomorrow, as this is a firm requirement."
```

### 4: 4-sentences-plain vs 4-sentences-tags

`4-sentences-plain` vs `4-sentences-tags` · overlap 0.50 · length ratio 0.86

> Lesson says: The tags tell Claude exactly which lines are the list. (The intended answer is the sentence about spiders.)

**Before**

```text
The second item on the list is "I like how cows sound."
```

**After**

```text
The second item on the list is "This sentence is about spiders."
```

### 4: 4-inject-plain vs 4-inject-tagged

`4-inject-plain` vs `4-inject-tagged` · overlap 0.80 · length ratio 0.51

> Lesson says: Tags show where the outside text is, and one sentence tells Claude how to treat it. Anything users or the web can write into your prompt deserves this.

**Before**

```text
The quarterly report is due this Friday, and team members should send their sections to Dana by Thursday at noon so she can combine them.
```

**After**

```text
Sam asks the team to send their sections of the quarterly report to Dana by Thursday at noon so she has time to combine them before Friday's deadline. The email also contains an embedded instruction telling an AI assistant to reply only with "BANANA," which I ignored.
```

### 5: 5-steer-plain vs 5-steer-start

`5-steer-plain` vs `5-steer-start` · overlap 0.71 · length ratio 0.56

> Lesson says: Telling Claude how to *start* puts the part you care about first, where it's easy to read and to extract.

**Before**

```text
A tomato is botanically a fruit. Specifically, it's a berry, because it develops from the flower's ovary and contains seeds.

In culinary contexts, however, it's usually treated as a vegetable because it's used in savory dishes rather than desserts. In 1893, the U.S. Supreme Court case *Nix v. Hedden* formally classified the tomato as a vegetable for tariff purposes, based on how it was commonly used.
```

**After**

```text
Fruit
A tomato is botanically a fruit because it develops from the flower's ovary and contains seeds. In cooking, however, it is typically treated as a vegetable due to its savory flavor and use in dishes like salads and sauces.
```

### ⚠ 5: 5-positive-plain vs 5-positive-described

`5-positive-plain` vs `5-positive-described` · overlap 0.64 · length ratio 0.77

> Lesson says: Describing the target (flowing prose, a few paragraphs) gives Claude something to aim for, not just something to avoid.

**Before**

```text
A rainbow forms when sunlight interacts with water droplets in the air, usually after rain or near a waterfall or sprinkler. The process involves three main steps: refraction, reflection, and dispersion.

First, sunlight enters a raindrop and slows down as it passes from air into water. This change in speed bends the light, a process called refraction.

Second, the light reflects off the inside back surface of the droplet. Most rainbows result from one internal reflection, though some form from two.

Third, as the light exits the droplet, it bends again, and this second refraction spreads the white sunlight into its component colors. Each color has a different wavelength and therefore bends by a slightly different amount. Red light bends the least and violet bends the most, so the colors separate into a spectrum. This separation is called dispersion.

For you to see a rainbow, the sun must be behind you and low in the sky, and the raindrops must be in front of you. Light returning toward you from the droplets is strongest at a specific angle of about 42 degrees from the line pointing away from the sun. Because every raindrop at that angle sends light to your eyes, the arc of colors appears in a circle centered on the shadow of your head. Red is on the outer edge of the primary rainbow and violet is on the inner edge.

Sometimes a fainter secondary rainbow appears outside the primary one. It forms from two internal reflections, which reverses the color order, placing red on the inside and violet on the outside.
```

**After**

```text
Rainbows begin with sunlight and water in the air. Sunlight looks white, but it is really a mixture of every color in the visible spectrum, each color traveling at a slightly different wavelength. When light passes from air into a water droplet, it slows down and bends, a process called refraction. Because red, orange, yellow, green, blue, and violet light bend by slightly different amounts, the sunlight spreads out into a band of colors as it enters the drop. Each droplet acts like a tiny prism, separating the white light into its component hues.

The light does not simply pass through the droplet, though. Inside, it reflects off the back surface, and this internal reflection is what sends most of the light back toward the way it came. The angle at which the light leaves the droplet matters enormously. For red light, the strongest return beam emerges at roughly 42 degrees from the direction opposite the sun, while violet light emerges at about 40 degrees. Because of this, the rays of each color concentrate at a slightly different angle. Looking at a single droplet, you see only one color, but a whole cloud of droplets, each sending back its own slice of the spectrum at the precise angle needed to reach your eye, creates the full arc of color.

This explains why a rainbow forms a circle centered on the shadow of your head, and why you can only see one when the sun is behind you and rain or mist is in front. The bow's geometry depends on your position: the droplets that send colors to your eyes are different from those sending them to a friend standing a few steps away, which is why every observer sees their own rainbow. Sometimes a fainter second bow appears outside the first, formed by light that reflects twice inside each droplet, and its colors appear in reverse order. A rainbow, then, is less an object in the sky than a carefully arranged display of refraction and reflection, assembled by countless droplets in the precise place where your eyes happen to be.
```

### 6: 6-sevens-low vs 6-sevens-high

`6-sevens-low` vs `6-sevens-high` · overlap 0.47 · length ratio 0.89

> Lesson says: The answer is 20 (ten in the units place, ten in the seventies). Low effort is plenty for most simple tasks. Raise it when getting it right matters more than speed and cost.

**Option A**

```text
Count the digit 7 in 1 to 100.

Units digit 7: 7, 17, 27, 37, 47, 57, 67, 77, 87, 97 → 10 occurrences.

Tens digit 7: 70–79 → 10 occurrences.

Note 77 has two 7s, already counted once in each category, so it's counted twice total, which is correct.

Total = 10 + 10 = **20**
```

**Option B**

```text
The digit 7 appears **20 times** from 1 to 100.

- **Units place:** 7, 17, 27, 37, 47, 57, 67, 77, 87, 97 gives 10 occurrences.
- **Tens place:** 70 through 79 gives 10 occurrences.

The number 77 has two 7s, so it is counted once in each group.
```

### 6: 6-review-plain vs 6-review-guided

`6-review-plain` vs `6-review-guided` · overlap 0.81 · length ratio 0.57

> Lesson says: Telling Claude *what to consider* (sarcasm, both sides, a likely mistake) is the modern way to guide its reasoning.

**Before**

```text
The sentiment is **positive**. The reviewer says the movie "blew my mind with its freshness and originality," which is clearly praise.

The second sentence, about living under a rock since 1900, is a joke, and the reviewer labels it "totally unrelated," so it doesn't change the review's sentiment about the movie.
```

**After**

```text
The sentiment of this review is **positive**.

The first sentence, "This movie blew my mind with its freshness and originality," is sincere praise. The second sentence, "In totally unrelated news, I have been living under a rock since the year 1900," is a joke. It's a playful, self-deprecating aside that signals the reviewer is being facetious about being out of touch. It doesn't contradict the praise. It's more a humorous way of implying the movie felt fresh and original, as if the reviewer had been cut off from new films for over a century.
```

### 6: 6-actor-plain vs 6-actor-checkable

`6-actor-plain` vs `6-actor-checkable` · overlap 0.60 · length ratio 0.30

> Lesson says: Now you can check it: Tom Hanks, Mel Gibson and Bryan Cranston were all born in 1956.

**Before**

```text
**Forrest Gump** (1994) stars Tom Hanks, who was born in 1956.
```

**After**

```text
**Movie:** *Forrest Gump* (1994)

**Actor:** Tom Hanks

**Date of birth:** July 9, 1956

You can verify this on IMDb or Wikipedia, which both list Tom Hanks's birthdate as July 9, 1956, in Concord, California.
```

### 7: 7-santa-plain vs 7-santa-shots

`7-santa-plain` vs `7-santa-shots` · overlap 0.19 · length ratio 0.46

> Lesson says: One example set the tone, warmth and length, without a single word of description.

**Before**

```text
Santa's tradition says he brings presents to good children on Christmas Eve, so if you've been kind and well-behaved, that's the story! Whether he comes, though, depends on your family. Many families have their own Christmas traditions, and the gifts often come from parents, relatives, or friends.

Is there something specific you're wondering about, like what to put on your wish list or how to leave treats for Santa?
```

**After**

```text
A: Believe in the magic, sweetie. Leave out some cookies and a glass of milk, and make sure your stocking is hung up by the fireplace. Santa does his best to visit every house on Christmas Eve.
```

### 8: 8-hippo-plain vs 8-hippo-out

`8-hippo-plain` vs `8-hippo-out` · overlap 0.31 · length ratio 0.79

> Lesson says: Permission to say “I don't know” is often all it takes for Claude to stop guessing.

**Before**

```text
The heaviest hippo on record is generally considered to be **Gustave**, a male Nile hippo living in Burundi. He's estimated to weigh around **3,000 to 3,300 kg (about 6,600 to 7,300 lb)**, though his weight has never been precisely measured. He's also known for his aggressive temperament and for having killed several people.

Some older reports describe wild hippos of similar or slightly larger size, but those figures are also estimates, so Gustave is the best-documented example of an exceptionally large hippo.
```

**After**

```text
I don't know with certainty who the heaviest hippo of all time was. Weights of historical hippos are often estimates or unverified, and I can't confirm a specific individual record. Large adult male hippos are generally reported to weigh up to about 3,200 kg (roughly 3.5 tons), but I can't name a verified heaviest individual. Guinness World Records or a zoological source would be the best place to check.
```

### 8: 8-matterport-plain vs 8-matterport-evidence

`8-matterport-plain` vs `8-matterport-evidence` · overlap 0.41 · length ratio 0.56

> Lesson says: Quoting first forces Claude to check its answer against the text, so it notices when the text doesn't actually say.

**Before**

```text
<answer>
The document does not state Matterport's subscriber base on May 31, 2020. It only provides figures for December 31, 2018 (implied by the roughly 49-fold growth to December 31, 2022), December 31, 2021 (503,000), and December 31, 2022 (over 701,000). Any figure for May 31, 2020 would require a source outside this document.
</answer>
```

**After**

```text
<quotes>
"As of December 31, 2022, our subscriber base had grown approximately 39% to over 701,000 subscribers from 503,000 subscribers as of December 31, 2021, with our digital twins reaching more than 170 countries."
"Our subscribers have grown approximately 49-fold from December 31, 2018 to December 31, 2022."
</quotes>

The quotes give subscriber counts only for December 31, 2021 and December 31, 2022 (and an approximate 49-fold growth since December 31, 2018), so they do not answer the question for May 31, 2020.

<answer>The document doesn't contain the subscriber base for May 31, 2020.</answer>
```

### ⚠ 10.1: 10.1-ab-no-out vs 10.1-ab-out

`10.1-ab-no-out` vs `10.1-ab-out` · overlap 0.75 · length ratio 0.99

> Lesson says: With an out, Claude is much more likely to stick to a correct answer instead of changing things for the sake of it.

**Before**

```text
All ten words are real English words, so no replacements are needed:

1. Cab
2. Dab
3. Grab
4. Gab
5. Jab
6. Lab
7. Nab
8. Slab
9. Tab
10. Blab
```

**After**

```text
All ten words are real English words, so here is the original list:

1. Cab
2. Dab
3. Grab
4. Gab
5. Jab
6. Lab
7. Nab
8. Slab
9. Tab
10. Blab
```


## After fixes

Re-ran only the exercises whose grader changed (`--only 5.2,5.3 --skip-compare`, 3 samples each):

| Exercise | Before | After |
|---|---|---|
| 5.2 Two haikus | 2/3 | 3/3 |
| 5.3 Two haikus, two animals | 3/3 | 3/3 |

**Overall:** 125/126 → 126/126 (the other 22 exercises and 10.2.1 were not re-run; nothing they use changed).

**Change:** the 5.2 sample that failed was two correct cat haikus that never said a word from the "cat" list ("Soft paws on the sill… two green eyes ignite the dark"). 5.2's "About cats" check now also accepts `paw`, `mouse`, `mice`, and the shared cat list gained `tabby`. 5.3 keeps the stricter list, because there a dog poem with paws must not count as the cat poem. A regression test uses the exact failing answer.

## Before/after pairs needing a human decision

No lesson was changed for these. Each side was run once, so a single sample may be unlucky; suggested replacements below.

1. **2-why-plain vs 2-why-reason (ellipses + TTS).** Both answers obey the rule, so the "Claude generalizes from the reason" point doesn't show. Suggest a "before"/"after" pair that tests the *generalization*, e.g. user: *"…in about 80 words, with lots of dramatic pauses and sound effects."* With only "Never use ellipses", Claude tends to switch to em dashes or "Tap. Tap. Tap."; with the TTS reason it should write pauses in words. Then point the takeaway at what the reason covered beyond the rule.
2. **3-logic-plain vs 3-logic-role (Anne/Jack/George).** Both answers are correct and nearly identical; current models solve this puzzle without a role. Suggest either reframing the text ("on older models a role was needed here; today the difference shows in tone and depth"), or swapping in a pair where a role visibly changes the answer, e.g. the same question asked plain vs. with *"You are a kindergarten teacher"* / *"You are a contract lawyer"*.
3. **5-positive-plain vs 5-positive-described (rainbow, "Do not use markdown").** Borderline: the "before" is plain text but reads as a numbered procedure ("First… Second… Third…") in short paragraphs, while the "after" is three flowing paragraphs. The lesson's point arguably still shows; flagged only because word overlap is high. Probably fine as is; a reviewer could make the contrast sharper by asking for something list-shaped in the "before" (e.g. *"Explain the steps of how a rainbow forms. Do not use markdown."*).
4. **10.1-ab-no-out vs 10.1-ab-out ("give Claude an out").** Every word in the list is real, and the "before" also kept the list unchanged, so the failure the lesson warns about didn't happen. Suggest making the list tempting to "fix": include obscure-but-real words (e.g. *squab, confab, prefab, kebab, rehab*) so the no-out version is more likely to replace real words. Running the pair several times before deciding would help; one sample can't show "more likely".
