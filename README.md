# GM's Creative Spark

Build a single-page tool called "GM Co-Pilot" for Quest Craft. It has a textarea where a Game Master describes an unexpected player choice, and a button that sends that text to a backend function which calls the Anthropic API (model claude-sonnet-4-6) with a system prompt I'll provide, and displays the result in five sections: Possible Outcomes, Narration to Read Aloud, Consequence for Later, GM Reminder, and Safety Note. Store the Anthropic API key as a secret in a Supabase edge function, don't put it in client-side code. Use a dark plum background (#2c1a1d), a warm orange accent (#d98a3d), and a teal accent (#4f9b93), with a serif display font for headings.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1adca513-4722-4e90-a7f8-fd2b0819f958).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
