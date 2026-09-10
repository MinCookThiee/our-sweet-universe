import nextEnv from "@next/env";
import { neon } from "@neondatabase/serverless";
import { littleQuestionSeed } from "../src/lib/little-question-seed";

nextEnv.loadEnvConfig(process.cwd());

async function main() {
  if (!process.env.DATABASE_URL)
    throw new Error("Set DATABASE_URL in .env.local first.");
  const db = neon(process.env.DATABASE_URL);
  await db.transaction(
    [
      // A question that has appeared in a shared round is history and stays.
      // Unused prompts can safely be replaced when this curated source changes.
      db`delete from little_question_bank
         where not exists (
           select 1 from little_question_rounds
           where little_question_rounds.question_id = little_question_bank.id
         )`,
      ...littleQuestionSeed.map(([category, prompt], index) =>
      db`insert into little_question_bank (prompt, category, sort_order)
         values (${prompt}, ${category}, ${index + 1})
         on conflict (prompt) do nothing`,
      ),
    ],
  );
  console.log(`${littleQuestionSeed.length} Burmese little questions are ready.`);
}

main().catch(() => {
  console.error("Couldn’t prepare the question bank. Check the database connection and migrations.");
  process.exitCode = 1;
});
