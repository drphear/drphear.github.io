const NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const CIRCLE = [
  { tonic: 0, major: "C", minor: "Am" },
  { tonic: 7, major: "G", minor: "Em" },
  { tonic: 2, major: "D", minor: "Bm" },
  { tonic: 9, major: "A", minor: "F#m" },
  { tonic: 4, major: "E", minor: "C#m" },
  { tonic: 11, major: "B", minor: "G#m" },
  { tonic: 6, major: "F#", minor: "D#m" },
  { tonic: 1, major: "Db", minor: "Bbm" },
  { tonic: 8, major: "Ab", minor: "Fm" },
  { tonic: 3, major: "Eb", minor: "Cm" },
  { tonic: 10, major: "Bb", minor: "Gm" },
  { tonic: 5, major: "F", minor: "Dm" },
];

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10];
const MAJOR_QUALITIES = ["", "m", "m", "", "", "m", "dim"];
const MINOR_QUALITIES = ["m", "dim", "", "m", "m", "", ""];
const MAJOR_DEGREES = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
const MINOR_DEGREES = ["i", "ii°", "III", "iv", "v", "VI", "VII"];

let selected = { tonic: 0, mode: "major" };
let enteredChords = [];

function useFlats(tonic, mode) {
  const flatMajorTonics = [1, 3, 5, 8, 10];
  const flatMinorTonics = [0, 2, 3, 5, 7, 10];
  return (mode === "major" ? flatMajorTonics : flatMinorTonics).includes(tonic);
}

function noteName(index, tonic, mode) {
  return (useFlats(tonic, mode) ? NOTES_FLAT : NOTES_SHARP)[(index + 12) % 12];
}

function keyName(tonic, mode) {
  return `${noteName(tonic, tonic, mode)} ${mode}`;
}

function relativeKey(tonic, mode) {
  return mode === "major"
    ? { tonic: (tonic + 9) % 12, mode: "minor" }
    : { tonic: (tonic + 3) % 12, mode: "major" };
}

function diatonicChords(tonic, mode) {
  const intervals = mode === "major" ? MAJOR_INTERVALS : MINOR_INTERVALS;
  const qualities = mode === "major" ? MAJOR_QUALITIES : MINOR_QUALITIES;
  const degrees = mode === "major" ? MAJOR_DEGREES : MINOR_DEGREES;
  return intervals.map((interval, index) => ({
    root: (tonic + interval) % 12,
    quality: qualities[index],
    name: `${noteName(tonic + interval, tonic, mode)}${qualities[index]}`,
    degree: degrees[index],
  }));
}

function primaryChords(tonic, mode) {
  const chords = diatonicChords(tonic, mode);
  return [chords[0], chords[3], chords[4]];
}

function pentatonic(tonic, mode) {
  const intervals = mode === "major" ? [0, 2, 4, 7, 9] : [0, 3, 5, 7, 10];
  return intervals.map((interval) => noteName(tonic + interval, tonic, mode));
}

function chordMarkup(chords) {
  return chords.map((chord) => `<span>${chord.name}</span>`).join("");
}

function renderCircle() {
  const container = document.querySelector("#circle-keys");
  container.innerHTML = "";

  CIRCLE.forEach((key, index) => {
    const angle = (index * 30 - 90) * (Math.PI / 180);
    const options = [
      { label: key.major, tonic: key.tonic, mode: "major", radius: 42 },
      { label: key.minor, tonic: (key.tonic + 9) % 12, mode: "minor", radius: 29 },
    ];

    options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `key-button ${option.mode}`;
      button.textContent = option.label;
      button.style.left = `${50 + Math.cos(angle) * option.radius}%`;
      button.style.top = `${50 + Math.sin(angle) * option.radius}%`;
      button.setAttribute("aria-label", `Select ${keyName(option.tonic, option.mode)}`);
      button.dataset.tonic = option.tonic;
      button.dataset.mode = option.mode;
      button.addEventListener("click", () => selectKey(option.tonic, option.mode));
      container.appendChild(button);
    });
  });
}

function selectKey(tonic, mode, shouldScroll = false) {
  selected = { tonic, mode };
  const relative = relativeKey(tonic, mode);
  const major = mode === "major" ? selected : relative;
  const minor = mode === "minor" ? selected : relative;

  document.querySelectorAll(".key-button").forEach((button) => {
    const isSelected = Number(button.dataset.tonic) === tonic && button.dataset.mode === mode;
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  document.querySelector("#center-key").textContent = noteName(tonic, tonic, mode);
  document.querySelector("#center-mode").textContent = mode;
  document.querySelector("#key-title").textContent = keyName(tonic, mode);
  document.querySelector("#primary-name").textContent = keyName(tonic, mode);
  document.querySelector("#primary-chords").innerHTML = chordMarkup(primaryChords(tonic, mode));
  document.querySelector("#relative-name").textContent = keyName(relative.tonic, relative.mode);
  document.querySelector("#relative-chords").innerHTML = chordMarkup(primaryChords(relative.tonic, relative.mode));
  document.querySelector("#major-pentatonic-name").textContent = keyName(major.tonic, "major");
  document.querySelector("#major-pentatonic-notes").innerHTML = pentatonic(major.tonic, "major").map((note) => `<span>${note}</span>`).join("");
  document.querySelector("#minor-pentatonic-name").textContent = keyName(minor.tonic, "minor");
  document.querySelector("#minor-pentatonic-notes").innerHTML = pentatonic(minor.tonic, "minor").map((note) => `<span>${note}</span>`).join("");
  document.querySelector("#palette-key").textContent = keyName(tonic, mode);
  document.querySelector("#diatonic-chords").innerHTML = diatonicChords(tonic, mode)
    .map((chord) => `<div class="degree-chord"><strong>${chord.name}</strong><small>${chord.degree}</small></div>`)
    .join("");

  if (shouldScroll) document.querySelector("#explore").scrollIntoView({ behavior: "smooth" });
}

function parseChord(raw) {
  const cleaned = raw.trim().replace(/♯/g, "#").replace(/♭/g, "b");
  const match = cleaned.match(/^([A-Ga-g])([#b]?)(?:(maj|min|m|dim|°))?(?:7)?$/i);
  if (!match) return null;

  const letterSemitones = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  let root = letterSemitones[match[1].toUpperCase()];
  if (match[2] === "#") root += 1;
  if (match[2] === "b") root -= 1;
  root = (root + 12) % 12;

  const suffix = (match[3] || "").toLowerCase();
  const quality = suffix === "m" || suffix === "min" ? "m" : suffix === "dim" || suffix === "°" ? "dim" : "";
  const accidental = match[2];
  const displayRoot = accidental === "b" ? NOTES_FLAT[root] : NOTES_SHARP[root];
  return { root, quality, name: `${displayRoot}${quality}` };
}

function addFromInput() {
  const input = document.querySelector("#chord-input");
  const parts = input.value.split(/[\s,]+/).filter(Boolean);
  if (!parts.length) return true;

  const invalid = [];
  parts.forEach((part) => {
    const chord = parseChord(part);
    if (!chord) invalid.push(part);
    else if (!enteredChords.some((item) => item.root === chord.root && item.quality === chord.quality)) enteredChords.push(chord);
  });

  if (invalid.length) {
    document.querySelector("#input-error").textContent = `Couldn't read: ${invalid.join(", ")}. Try a chord like F#m or Bb.`;
    return false;
  }

  input.value = "";
  document.querySelector("#input-error").textContent = "";
  renderChips();
  return true;
}

function renderChips() {
  const chips = document.querySelector("#chord-chips");
  chips.innerHTML = "";
  enteredChords.forEach((chord, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chord-chip";
    button.textContent = chord.name;
    button.setAttribute("aria-label", `Remove ${chord.name}`);
    button.addEventListener("click", () => {
      enteredChords.splice(index, 1);
      renderChips();
      if (enteredChords.length) analyzeChords();
      else document.querySelector("#finder-results").hidden = true;
    });
    chips.appendChild(button);
  });
}

function candidateScore(tonic, mode) {
  const palette = diatonicChords(tonic, mode);
  let points = 0;
  let matched = 0;

  enteredChords.forEach((chord) => {
    const exactIndex = palette.findIndex((item) => item.root === chord.root && item.quality === chord.quality);
    const rootIndex = palette.findIndex((item) => item.root === chord.root);
    if (exactIndex >= 0) {
      points += 3;
      matched += 1;
      if (exactIndex === 0) points += 0.55;
      if (exactIndex === 4) points += 0.2;
    } else if (rootIndex >= 0) {
      points += 0.35;
    }
  });

  const maximum = enteredChords.length * 3 + 0.55 + 0.2;
  return { tonic, mode, points, matched, fit: Math.min(100, Math.round((points / maximum) * 100)) };
}

function analyzeChords() {
  if (!addFromInput()) return;
  if (!enteredChords.length) {
    document.querySelector("#input-error").textContent = "Add at least one chord to find a key.";
    return;
  }

  const candidates = [];
  for (let tonic = 0; tonic < 12; tonic += 1) {
    candidates.push(candidateScore(tonic, "major"), candidateScore(tonic, "minor"));
  }
  candidates.sort((a, b) => b.points - a.points || (a.mode === "major" ? -1 : 1));

  const best = candidates[0];
  const palette = diatonicChords(best.tonic, best.mode);
  const suggestions = palette.filter((chord) => !enteredChords.some((item) => item.root === chord.root && item.quality === chord.quality));
  const alternatives = candidates.filter((candidate, index) => index > 0 && candidate.points > 0).slice(0, 3);

  document.querySelector("#match-name").textContent = keyName(best.tonic, best.mode);
  document.querySelector("#match-detail").textContent = `${best.matched} of ${enteredChords.length} chord${enteredChords.length === 1 ? "" : "s"} fit the key naturally.`;
  document.querySelector("#match-score").textContent = best.fit;
  document.querySelector("#suggested-chords").innerHTML = suggestions.length
    ? suggestions.map((chord) => `<button type="button" data-chord="${chord.name}" title="Add ${chord.name}">${chord.name}</button>`).join("")
    : "<span>You already have the full diatonic palette.</span>";
  document.querySelector("#alternative-keys").innerHTML = alternatives
    .map((candidate) => `<button type="button" class="alternative-key" data-tonic="${candidate.tonic}" data-mode="${candidate.mode}">${keyName(candidate.tonic, candidate.mode)} · ${candidate.fit}%</button>`)
    .join("");
  document.querySelector("#finder-results").hidden = false;

  document.querySelectorAll("#suggested-chords button").forEach((button) => {
    button.addEventListener("click", () => {
      const chord = parseChord(button.dataset.chord);
      if (chord && !enteredChords.some((item) => item.root === chord.root && item.quality === chord.quality)) {
        enteredChords.push(chord);
        renderChips();
        analyzeChords();
      }
    });
  });

  document.querySelectorAll(".alternative-key").forEach((button) => {
    button.addEventListener("click", () => selectKey(Number(button.dataset.tonic), button.dataset.mode, true));
  });

  selectKey(best.tonic, best.mode);
}

document.querySelector("#chord-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === ",") {
    event.preventDefault();
    addFromInput();
  }
});

document.querySelector("#analyze-button").addEventListener("click", analyzeChords);

document.querySelectorAll(".example-button").forEach((button) => {
  button.addEventListener("click", () => {
    enteredChords = button.dataset.chords.split(",").map(parseChord);
    renderChips();
    analyzeChords();
    document.querySelector("#chord-finder").scrollIntoView({ behavior: "smooth" });
  });
});

renderCircle();
selectKey(0, "major");
