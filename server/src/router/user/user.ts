import { me } from './function/me';
import { search } from './function/search';
import { retrieve } from './function/retrieve';
import { login } from './function/login';
import { create } from './function/create';
import { router} from '../../trpc';

export const userRouter = router({
  create,
  login,
  search,
  retrieve,
  me,
});
