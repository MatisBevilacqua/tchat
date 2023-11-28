import { z } from "zod";

const env = z.object({
  SECRET: z.string()
})

env.parse(process.env)

declare global {
  namespace NodeJS {
    interface ProcessEnv 
      extends z.infer<typeof env> {}
  }
}
