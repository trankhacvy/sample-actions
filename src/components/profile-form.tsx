"use client";

import Api from "@/lib/api";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Card,
  CardBody,
  CardFooter,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Button,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";

export const ProfileSchema = z.object({
  avatar: z.any(),
  name: z.string().trim().min(3),
  bio: z.string().trim().min(3),
});

export default function ProfileForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: "",
      bio: "",
    },
  });

  const { publicKey } = useWallet();
  const router = useRouter();

  const { mutate } = api.user.create.useMutation({
    onSuccess: (data) => {
      router.replace(`/profile/${data.wallet}`);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  async function onSubmit(values: z.infer<typeof ProfileSchema>) {
    try {
      if (!publicKey) {
        alert("Please connect to wallet");
        return;
      }

      const uploadResponse = await Api.fakeUpload(values.avatar?.[0]);

      await mutate({
        name: values.name,
        bio: values.bio,
        wallet: publicKey.toBase58(),
        avatar: uploadResponse.location,
      });
    } catch (error: any) {
      console.error(error);
    }
  }

  return (
    <main className="container mx-auto px-4 py-10 md:px-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mx-auto w-full max-w-lg">
          <CardBody className="flex flex-col gap-5">
            <FormControl isInvalid={!!errors.avatar}>
              <FormLabel>Avatar</FormLabel>
              <Input
                {...register("avatar")}
                type="file"
                placeholder="Upload your avatar"
              />
              <FormErrorMessage>
                {!!errors.avatar ? (errors.avatar.message as string) : ""}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Your name</FormLabel>
              <Input {...register("name")} type="text" placeholder="Kelly" />
              <FormErrorMessage>
                {!!errors.name ? (errors.name.message as string) : ""}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.bio}>
              <FormLabel>Bio</FormLabel>
              <Textarea
                {...register("bio")}
                rowGap={5}
                placeholder="Full time trader"
              />
              <FormErrorMessage>
                {!!errors.bio ? (errors.bio.message as string) : ""}
              </FormErrorMessage>
            </FormControl>
          </CardBody>
          <CardFooter className="justify-end gap-4">
            <Button variant="outline">Cancel</Button>
            <Button isLoading={isSubmitting} type="submit" colorScheme="yellow">
              Create
            </Button>
          </CardFooter>
        </Card>
      </form>
    </main>
  );
}
