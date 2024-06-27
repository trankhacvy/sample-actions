import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Text, Link } from "@chakra-ui/react";

type Props = {
  params: {
    wallet: string;
  };
};

export default async function Profile({ params: { wallet } }: Props) {
  const user = await api.user.getByWallet({ wallet });

  if (!user) {
    notFound();
  }

  return (
    <main className="container mx-auto flex flex-col gap-4 px-4 py-10 md:px-6">
      <div className="relative aspect-square w-full max-w-xs">
        <Image src={user.avatar ?? ""} fill alt={user.name} />
      </div>
      <Link href="/" isExternal>
        <Text fontSize="3xl" className="font-bold">
          {user.name}
        </Text>
      </Link>

      <Text>{user.bio}</Text>
    </main>
  );
}
