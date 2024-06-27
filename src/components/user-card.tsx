import { Prisma } from "@prisma/client";

import { CopyIcon, CheckIcon } from "@chakra-ui/icons";
import {
  Card,
  CardBody,
  Divider,
  Heading,
  Image,
  Stack,
  Text,
  useClipboard,
  IconButton,
} from "@chakra-ui/react";
import { env } from "@/env";

export function UserCard({ user }: { user: Prisma.UserGetPayload<{}> }) {
  const { onCopy, hasCopied } = useClipboard(
    `${env.NEXT_PUBLIC_FE_BASE_URL}/profile/${user.wallet}`,
  );

  return (
    <Card>
      <CardBody>
        <Image
          className="aspect-square"
          src={user.avatar ?? ""}
          alt={user.name}
          borderRadius="lg"
        />
        <Stack mt="6" spacing="3">
          <div className="flex items-center gap-2">
            <Heading size="md">{user.name}</Heading>
            <IconButton
              onClick={onCopy}
              size="sm"
              aria-label={hasCopied ? "Copied" : "Copy"}
              icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
            />
          </div>
          <Text noOfLines={2}>{user.bio}</Text>
        </Stack>
      </CardBody>
      <Divider />
    </Card>
  );
}
