import { api } from "@/trpc/server";
import {
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
} from "@solana/actions";

import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";

const DEFAULT_SOL_AMOUNT: number = 0.001;

type Params = {
  wallet: string;
};

export const GET = async (req: Request, context: { params: Params }) => {
  try {
    const requestUrl = new URL(req.url);

    const user = await api.user.getByWallet({ wallet: context.params.wallet });

    if (!user) {
      return Response.json(
        {
          error: true,
        },
        {
          headers: ACTIONS_CORS_HEADERS,
        },
      );
    }

    const baseHref = new URL(
      `/api/profile/${user.wallet}`,
      requestUrl.origin,
    ).toString();

    const payload: ActionGetResponse = {
      title: user.name,
      icon: user.avatar ?? "",
      description: user.bio ?? "",
      label: "Transfer", // this value will be ignored since `links.actions` exists
      links: {
        actions: [
          {
            label: "Send 1 SOL",
            href: `${baseHref}?amount=${"1"}`,
          },
          {
            label: "Send 5 SOL", // button text
            href: `${baseHref}?amount=${"5"}`,
          },
          {
            label: "Send 10 SOL", // button text
            href: `${baseHref}?amount=${"10"}`,
          },
          {
            label: "Send SOL", // button text
            href: `${baseHref}?amount={amount}`, // this href will have a text input
            parameters: [
              {
                name: "amount", // parameter name in the `href` above
                label: "Enter the amount of SOL to send", // placeholder of the text input
                required: true,
              },
            ],
          },
        ],
      },
    };

    console.log("baseHref", baseHref);

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    console.log(err);
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};

export const OPTIONS = GET;

export const POST = async (req: Request, context: { params: Params }) => {
  try {
    const requestUrl = new URL(req.url);
    console.log("post requestUrl", requestUrl);
    const { amount } = validatedQueryParams(requestUrl);

    console.log("amount", amount);

    const body: ActionPostRequest = await req.json();

    console.log("post body", body);

    // validate the client provided input
    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      return new Response('Invalid "account" provided', {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }

    // validate the client provided input
    let receiver: PublicKey;
    try {
      receiver = new PublicKey(context.params.wallet);
    } catch (err) {
      return new Response('Invalid "receiver" provided', {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }

    const connection = new Connection(
      process.env.SOLANA_RPC! || clusterApiUrl("mainnet-beta"),
    );

    // ensure the receiving account will be rent exempt
    // const minimumBalance = await connection.getMinimumBalanceForRentExemption(
    //   0, // note: simple accounts that just store native SOL have `0` bytes of data
    // );

    // if (amount * LAMPORTS_PER_SOL < minimumBalance) {
    //   throw `account may not be rent exempt: ${receiver.toBase58()}`;
    // }

    const transaction = new Transaction();
    transaction.feePayer = account;

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: receiver,
        lamports: amount * LAMPORTS_PER_SOL,
      }),
    );

    // set the end user as the fee payer
    transaction.feePayer = account;

    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: `Send ${amount} SOL to ${receiver.toBase58()}`,
      },
      // note: no additional signers are needed
      // signers: [],
    });

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    console.log(err);
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};

function validatedQueryParams(requestUrl: URL) {
  let amount: number = DEFAULT_SOL_AMOUNT;

  try {
    if (requestUrl.searchParams.get("amount")) {
      amount = parseFloat(requestUrl.searchParams.get("amount")!);
    }

    if (amount <= 0) throw "amount is too small";
  } catch (err) {
    throw "Invalid input query parameter: amount";
  }

  return {
    amount,
  };
}
