# Travel Desk — image and overlay manifest

Everything replaceable in `passport-travel-desk.html`, for bulk swapping.

Fill the **Replace with** lines and send this back — the replacements get applied
in one pass. Give the Cloudinary public ID (the `v1234…/filename.jpg` part) or the
full URL. Crop and format transforms are added automatically, so send the raw
upload and don't pre-compress.

---

## Part 1 — The application toggles

The five buttons on **step 2 of the application** ("How would you use it?").
Selecting one swaps the image and both lines of text on the left panel of the
Travel Desk. There is also a **default** state, shown from the moment the desk
opens until a choice is made.

### The box these images render into

| | Box | Shape | Overlay text starts |
|---|---|---|---|
| Desktop | 792 × 900 | **0.88** — slightly portrait | 72% down |
| Mobile | 375 × 244 | **1.54** — landscape masthead | 46% down |

These are **art-directed**: served through `c_fill,ar_4:5,g_auto` on desktop and
`c_fill,ar_3:2,g_auto` on mobile, re-requested when the breakpoint flips.
Cloudinary finds the subject, so any reasonable portrait or landscape file works.
The caption block carries its own gradient, so the bottom of each frame is
deliberately darkened.

---

### 0 · Default (no selection yet)

| | |
|---|---|
| **Current image** | `v1778190443/SnapInsta.to_635507810_18435836359116458_2001003794935302703_n_adxoql.jpg` |
| **Eyebrow** | The Privé Passport Member Team |
| **Overlay line** | Tell us how you travel for padel, and we’ll take it from there. |

> **Replace image with:**  
> **Replace eyebrow with:**  
> **Replace line with:**

---

### 1 · "Play while traveling"

| | |
|---|---|
| **Current image** | `v1775952719/One_Only_Aesthesis_P4_Tennis_People_Drone-1063_MASTER_2_jcy1tv.webp` |
| **Crop override** | `g_east` — the courts sit right of centre and automatic detection reads the buildings as the subject |
| **Eyebrow** | Padel Destinations |
| **Overlay line** | A padel court at every destination, part of the trip. |

> **Replace image with:**  
> **Replace eyebrow with:**  
> **Replace line with:**

---

### 2 · "Privé Miami or Montauk"

| | |
|---|---|
| **Current image** | `v1777425553/ChatGPT_Image_Apr_28_2026_09_18_58_PM_hodpz9.png` |
| **Eyebrow** | Privé Locations |
| **Overlay line** | Miami now, and when Montauk returns next season. |

> **Replace image with:**  
> **Replace eyebrow with:**  
> **Replace line with:**

---

### 3 · "Signature retreats"

| | |
|---|---|
| **Current image** | `v1788369821/JoeKelly_PaddleCourt_0552_copy_uby4fs_cetckn.jpg` |
| **Eyebrow** | Padel Experiences |
| **Overlay line** | Invited first, and special member pricing on every retreat. |

> **Replace image with:**  
> **Replace eyebrow with:**  
> **Replace line with:**

---

### 4 · "Hotel and resort privileges"

| | |
|---|---|
| **Current image** | `v1775999764/Fairmont_Royal_Palm_Marrakech11_qepqp1.jpg` |
| **Eyebrow** | Member privileges |
| **Overlay line** | You arrive recognized, at rates and benefits not available to the public. |

> **Replace image with:**  
> **Replace eyebrow with:**  
> **Replace line with:**

---

### 5 · "Community and events"

| | |
|---|---|
| **Current image** | `v1775399710/nathanhipgravevisuals_sleepgym-23_websize_jiixkg.jpg` |
| **Eyebrow** | The Privé community |
| **Overlay line** | Events around the world, on court. |

> **Replace image with:**  
> **Replace eyebrow with:**  
> **Replace line with:**

---

## Part 2 — The four pillar cards

The hover/click toggles in "One membership. Four ways to play." Each has an image
and a one-line caption over the bottom of it.

**Box:** 522 × 783 on desktop (**0.67**, portrait), about 327 × 300 on mobile
(**1.09**). Served through `c_fill,ar_4:5,g_auto`, so these are forgiving — any
reasonable landscape or portrait file works.

| # | Pillar | Current image | Caption |
|---|---|---|---|
| 01 | Padel Destinations | `v1788369821/JoeKelly_PaddleCourt_0552_copy_uby4fs_cetckn.jpg` | Nihi Sumba, and over 40 more like it. |
| 02 | Signature Experiences | `v1775680021/Villa-living-room_algtvz.jpg` | A week in Madagascar, the padel running through it. |
| 03 | Partner Clubs | `v1775952979/Rosewood_HK_Exterior_3_night_Large_oqqsyc.jpg` | Hong Kong, and a court arranged before you land. |
| 04 | Privé Miami and Montauk | `v1777408711/Untitled_design-94_ea2ofp.png` | The only court in the heart of Coral Gables. |

> **Replacements:**  
> 01 Padel Destinations — image:  ␣ caption:  
> 02 Signature Experiences — image:  ␣ caption:  
> 03 Partner Clubs — image:  ␣ caption:  
> 04 Privé Miami and Montauk — image:  ␣ caption:  

---

## Part 3 — The two fixed backgrounds

Not toggles, but the only other images on the page.

### Hero

| | |
|---|---|
| **Current image** | `v1788369761/hero-2_lkuamw.png` |
| **Box** | Full viewport — 1.60 on a laptop, **0.46 on a phone** |
| **Note** | A phone shows only the centre 26% of the width, full height. Text covers the bottom 69%, so the only clear band is the top third. |

> **Replace with:**

### Value / testimonial background

| | |
|---|---|
| **Current image** | `v1773539952/Destinations_-_Vila_Vita_Parc_r1gjac.jpg` |
| **Box** | 1180 × 644 (**1.83**) desktop, about 327 × 896 (**0.36**) mobile |
| **Note** | Sits under a 72% navy scrim with the price panel and testimonial on top. Deliberately atmospheric — fine detail will not read. |

> **Replace with:**

---

## Notes

- Every image is served with `q_auto,f_auto` — Cloudinary picks format and
  compression, so upload the full-quality file and don't pre-compress.
- The hero also feeds the `og:image` link preview. If it changes, that meta tag
  changes with it.
- `JoeKelly_PaddleCourt_0552_copy_uby4fs_cetckn` now appears **twice** — toggle 3
  ("Signature retreats") and pillar 01 ("Padel Destinations"). A visitor can see
  both in one session, so one of them may want its own image.
- Toggle 3's eyebrow reads "Padel Experiences" while the pillar card beside it is
  titled "Signature Experiences". Deliberate, or worth aligning.
