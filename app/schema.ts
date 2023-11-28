import type { AllSchemaEvent } from "../schema"
import z from "zod"

export const allSchemaEvent = z.custom<AllSchemaEvent>()
