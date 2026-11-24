import { useMutation } from '@tanstack/react-query';
import { postRegister } from '../api/auth';

export function useRegistrar() {
  return useMutation({ mutationFn: postRegister });
}
