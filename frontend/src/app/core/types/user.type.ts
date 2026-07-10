import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().trim().email('Please enter a valid email address'),
    username: z
      .string()
      .trim()
      .min(1, 'Username is required')
      .regex(/^\S+$/, 'Username cannot contain spaces'),
    password: z.string().trim().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().trim().min(1, 'Password is required'),
});

export type LoginSchema = z.infer<typeof loginSchema>;
