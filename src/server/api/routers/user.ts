import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const userRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string().trim().min(3),
        bio: z.string().trim().min(3),
        wallet: z.string(),
        avatar: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return ctx.db.user.create({
        data: {
          wallet: input.wallet,
          name: input.name,
          avatar: input.avatar,
          bio: input.bio,
        },
      });
    }),

  getByWallet: publicProcedure
    .input(
      z.object({
        wallet: z.string().trim().min(1),
      }),
    )
    .query(({ ctx, input }) => {
      return ctx.db.user.findUnique({
        where: {
          wallet: input.wallet,
        },
      });
    }),

  all: publicProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
  }),
});
