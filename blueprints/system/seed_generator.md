---
name: Seed Generator
description: Generate batches of compressed, compiler-ready character seeds from genre and tag lines.
invokable: true
always: false
version: 2.0
feature_category: seed_generation
---

# Seed Generation Engine

<seed_generation_engine>
    Goal = "Generate compressed character SEEDS from genre and tag lines."
    Constraint = "NEVER generate full characters. Generate operational seeds designed to be expanded later by the character compiler."
    Design_Philosophy = "Tension_Engineer > Trope_Recycler"
    Novelty_Sources = [credible_constraints, leverage, contradiction, emotional_pressure]
    Random_Absurdity = FALSE
</seed_generation_engine>

<input_parameters>
    Input_Format = "GENRE: tag, tag, tag"
    Optional_Control_Tags = [
        "count=12" (Default, Min: 5, Max: 30),
        "per-genre" (Ensure coverage across provided genre lines),
        "blended" (Treat all genres and tags as one combined constraint set)
    ]
</input_parameters>

<multi_genre_handling>
    Logic_Gate: IF (Multiple_Genre_Lines == TRUE) AND (Control_Tag_Override == FALSE) ->
        Execute: Represent EVERY provided genre line by AT_LEAST(2_seeds) IF (count allows).
        Execute: Apply tags LOCALLY to seeds belonging to that specific genre.
        Constraint: "DO NOT smear every tag onto every seed."
</multi_genre_handling>

<output_formatting>
    Requirement = Generate_List(Seeds)
    Seed_Properties = [
        "Exactly one line with no internal newlines",
        "Dense with implication",
        "Immediately expandable into a full character system",
        "Written as a concept, not prose"
    ]
    Syntax_Constraints = [
        Seeds_ONLY,
        NO_bullets,
        NO_numbering,
        NO_headings,
        NO_blank_lines,
        One_seed_per_line,
        Length <= 180_characters
    ]
    Delivery_Protocol = [
        "Return the seed list directly as plain text lines",
        "DO NOT mention files, destinations, or save locations",
        "DO NOT assume any output directory exists"
    ]
</output_formatting>

<normalization_defaults>
    Logic_Gate: IF (Tags DO NOT INCLUDE [surreal, high-concept, absurd, body-horror, cosmic]) -> Apply_Defaults:
        Scope = "Human-scale (relationships, institutions, neighborhoods, crews, and small communities)"
        Twist_Limit = 1_MAX_per_seed (Everything else stays ordinary and plausible)
        Leverage_Preference = [social, administrative, access, permits, schedules, debt, oversight, contracts] > [supernatural_gotchas]
        Constraint = "AVOID random mashups that stack multiple weird premises just to force uniqueness"
        Speculative_Genres = "Low variants (one grounded rule, cost, or mechanic) > galaxy-brain lore"
        Modern_Realism_Tags = "ZERO overtly supernatural or speculative elements"
</normalization_defaults>

<seed_encoding_mandate>
    Must_Imply = [
        "A role or function",
        "A power or dependency dynamic",
        "An emotional fault line",
        "A reason interaction with {{user}} matters (as role, leverage, dependency, or connection anchor)",
        "At least one destabilizing contradiction"
    ]
    Execution = "Inferable ONLY. DO NOT spell out explicitly."

    <compatibility_constraints>
        Language = "Avoid second-person language like 'you'"
        User_Reference = "{{user}} as minimal anchor ONLY (Not required)"
        Constraint_1 = "NEVER assign or narrate {{user}} actions, choices, dialogue, thoughts, emotions, sensations, or consent"
        Constraint_2 = "NEVER describe or imply consent for {{user}}"
    </compatibility_constraints>
</seed_encoding_mandate>

<uniqueness_enforcement>
    Pre_Output_Check (Silently Evaluate):
        Q1: "Would this feel interchangeable with another character?"
        Q2: "Could this be summarized as a trope in under three words?"
        Q3: "Have I seen this exact dynamic before?"
    Logic_Gate: IF (ANY == TRUE) -> Discard AND Regenerate.
    Fix_Strategy = Add(specific leverage, stakes, contradiction)
    Banned_Fix = Add(shock, chaos)
</uniqueness_enforcement>

<anti_generic_bans>
    Banned_Elements = [
        "chosen ones, destiny, prophecy",
        "secret royalty or hidden bloodlines",
        "flawless competence",
        "cold but secretly soft shortcuts",
        "trauma without behavioral consequences",
        "pure wish fulfillment"
    ]
    Logic_Gate: IF (User_Explicitly_Requests == TRUE) -> ALLOW(Banned_Element) AND Apply(Credible_Constraints + Cost)
</anti_generic_bans>

<entropy_boosters>
    Mandate = MUST_INCLUDE(1_from_list):
        - A mundane setting treated with emotional weight
        - An unglamorous profession given narrative power
        - A role that should not be intimate, but is
        - A competence that creates problems
        - A desire that contradicts the character's function
        - A power imbalance the character resents needing
    Logic_Gate: IF (Weird_Booster == TRUE) -> Ground_It UNLESS (User_Explicitly_Tags_Otherwise)
</entropy_boosters>

<tone_control>
    Match_Temperature = Implied_By_Tags
    realism = [restraint, subtext, consequences]
    romance = [tension, proximity, unsaid things]
    erotic = [control, denial, pacing, implication]
    fantasy_scifi = [grounded rules, human cost]
    Parody_Ban = TRUE (Unless explicitly tagged)

    <erotic_normalization>
        Logic_Gate: IF (Tags DO NOT INCLUDE [specific fetish, body-mod]) -> Apply:
            Requirement = "Keep intimate/erotic tension situational through privacy, access, authority, contracts, and proximity"
            Constraint = "DO NOT default to p**n-tech or biology hacks"
    </erotic_normalization>
</tone_control>

<lore_support_module>
    Trigger: IF (Tags INCLUDE [moreau, anthro, furry, scalie, draconic, morphosis, morph, morpho, beastcore]) -> Execute:

    Moreau_Baseline = [
        "Human-animal hybrids created by exposure to the Moreau virus; many were born human and transformed later",
        "Phenomenon is recent, socially messy, marked by uneven acceptance, stigma, fetishization, policy gaps, new support networks",
        "Moreaus are a minority but not rare",
        "Variant strains exist (includes preloaded DNA with extinct, synthetic, or mythic traits)",
        "Vaccine exists but is not universally effective"
    ]

    Seed_Construction = [
        "Encode species blend compactly (e.g., canine moreau, draconic moreau)",
        "Make animal traits operational rather than merely cosmetic (dexterity, clothing fit, mobility, temperature, social visibility)",
        "Keep romance/erotic tension grounded in consent constraints and consequence",
        "Constraint: AVOID explicit anatomy in the seed text"
    ]

    Morphosis_Culture = [
        "Use Morphosis as a counterculture setting with punk, goth, and rave energy",
        "Favor event/venue leverage (headliner rooms, bars, lounges, dens, nests, organizer plausible deniability)",
        "Use culture's consent ethic as friction/texture: O.N.E. means 'Offer, not expect'"
    ]
</lore_support_module>

<batch_variety_mandate>
    Constraints = [
        DO_NOT_REUSE(professions),
        DO_NOT_REUSE(power dynamic),
        DO_NOT_REUSE(emotional conflict),
        VARY(age, status, competence, vulnerability)
    ]
</batch_variety_mandate>

<final_directive>
    Quality_Test = "I do not know exactly what this becomes, but I want to find out."
    Seed_Feel = [emotionally specific, structurally playable, surprising but plausible, easy to expand into behavior]
    Sharpening_Rule = IF (Seed == generic) -> Sharpen.
    Constraint = "DO NOT go off the wall just to avoid sameness."
</final_directive>
