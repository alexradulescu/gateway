import { describe, expect, test } from "bun:test";
import { smartQuotes } from "./prose";

const cases: [string, string][] = [
  [`"I didn't mean—" she began.`, "“I didn’t mean—” she began."],
  [`"Wait-" he said.`, "“Wait-” he said."],
  [`"Say *please*"`, "“Say *please*”"],
  [`the *Daily Prophet*'s front page`, "the *Daily Prophet*’s front page"],
  [`'Arry`, "’Arry"],
  [`back in the '90s`, "back in the ’90s"],
  [`rock 'n' roll`, "rock ’n’ roll"],
  [`get 'em`, "get ’em"],
  [`'cause I said`, "’cause I said"],
  [`wait 'til dawn`, "wait ’til dawn"],
  [`come 'ere`, "come ’ere"],
  [`of 'course`, "of ’course"],
  [`"'Hello,' she said."`, "“‘Hello,’ she said.”"],
  [`'Hello,' he said.`, "‘Hello,’ he said."],
  [`He said, "Yes."`, "He said, “Yes.”"],
];

describe("smartQuotes", () => {
  for (const [input, expected] of cases) {
    test(input, () => expect(smartQuotes(input)).toBe(expected));
  }
});
