import Joi from "joi";

export const chatPromptSchema = Joi.object({
  prompt: Joi.string().trim().required(),

  // context is the current slides JSON (optional, defaults to empty object)
  context: Joi.object({
    title: Joi.string().allow("").optional(),

    // slides array: each slide is validated
    slides: Joi.array()
      .items(
        Joi.object({
          title: Joi.string().allow("").required(),
          bullets: Joi.array().items(Joi.string().allow("")).default([]),
          // image can be a URL, a data URI/base64 string, or null
          // we allow string or null here. If you want stricter checks (URL regex), add later.
          image: Joi.alternatives()
            .try(Joi.string(), Joi.allow(null))
            .optional(),
          // allow additional slide-level metadata if needed:
          // e.g., notes, layout, etc. Remove `.unknown(true)` to forbid extras.
        }).unknown(true) // allow future fields inside each slide (safe and flexible)
      )
      .default([]),
  })
    .default({})
    .optional(),
}).unknown(false); // disallow any keys other than prompt and context at top-level
