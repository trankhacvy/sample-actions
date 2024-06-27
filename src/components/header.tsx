"use client";

import Link from "next/link";
import ConnectWalletButton from "./connect-wallet";
import { Button } from "@chakra-ui/react";

export function Header() {
  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-6">
        <a className="inline-flex items-center gap-4" href="/">
          <img className="h-10 w-full" src="/logo.webp" />
          <span className="text-2xl font-extrabold">Blinks</span>
        </a>
        <div className="flex items-center gap-4">
          <Link href="/new">
            <Button>Create Profile</Button>
          </Link>
          <ConnectWalletButton />
        </div>
      </div>
    </header>
  );
}
