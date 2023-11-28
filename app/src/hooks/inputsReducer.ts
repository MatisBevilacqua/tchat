import { useReducer } from 'react';
import { z } from "zod"

export type InputsReducerState = {
  [key: string]: {
    input: string;
    error: string | undefined | null;
  };
};

const parseInput = (error: z.SafeParseReturnType<string, string>) => {
  if (error.success) return undefined;
  
  return error.error.issues[0].message;
};

export type Action = {
  key: string;
  input: string;
  parser: z.ZodString;
};

const inputsReducer = (state: InputsReducerState, action: Action) => {
  return {
    ...state,
    [action.key]: {
      input: action.input,
      error: parseInput(action.parser.safeParse(action.input)),
    },
  };
};

function arrToState<Keys extends string[]>(arr: Keys) {
  const result: Record<string, any> = {};
  for (const item of arr) {
    result[item] = {
      input: "",
      error: null,
    };
  }
  return result as Record<keyof Keys, {
    input: string;
    error: null;
  }>;
}

export function useInputsReducer<Keys extends string[]>(keys: Keys) {
  const reducer = useReducer(
    inputsReducer,
    arrToState(keys)
  );

  return reducer;
};
