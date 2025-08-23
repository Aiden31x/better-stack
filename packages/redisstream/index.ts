import { createClient, type RedisClientType } from "redis";

const client: RedisClientType = createClient();

client.on("error", (err) => console.error("Redis Client Error", err));
await client.connect();

type WebsiteEvent = {
  url: string;
  id: string;
};

type MessageType = {
  id: string;
  message: {
    url: string;
    id: string;
  };
};

const STREAM_NAME = "betterstack:website";

// Create stream and consumer group if they don't exist
async function ensureStreamAndGroup(consumerGroup: string) {
  try {
    // Check if stream exists, if not create it with a dummy message
    const streamInfo = await client.xInfoStream(STREAM_NAME);
    console.log(`✅ Stream ${STREAM_NAME} exists`);
  } catch (error) {
    // Stream doesn't exist, create it with a dummy message
    console.log(`📝 Creating stream ${STREAM_NAME}...`);
    await client.xAdd(STREAM_NAME, "*", { dummy: "init" });
    console.log(`✅ Stream ${STREAM_NAME} created`);
  }

  try {
    // Check if consumer group exists, if not create it
    const groupInfo = await client.xInfoGroups(STREAM_NAME);
    const groupExists = groupInfo.some(group => group.name === consumerGroup);

    if (!groupExists) {
      console.log(`📝 Creating consumer group ${consumerGroup}...`);
      await client.xGroupCreate(STREAM_NAME, consumerGroup, "0", { MKSTREAM: false });
      console.log(`✅ Consumer group ${consumerGroup} created`);
    } else {
      console.log(`✅ Consumer group ${consumerGroup} exists`);
    }
  } catch (error) {
    console.log(`📝 Creating consumer group ${consumerGroup}...`);
    await client.xGroupCreate(STREAM_NAME, consumerGroup, "0", { MKSTREAM: false });
    console.log(`✅ Consumer group ${consumerGroup} created`);
  }
}

// Add single website event
export async function xAdd({ url, id }: WebsiteEvent) {
  await client.xAdd(STREAM_NAME, "*", { url, id });
}

// Add multiple website events (sequentially)
export async function xAddBulk(websites: WebsiteEvent[]) {
  for (const site of websites) {
    await xAdd(site);
  }
  // OR parallel:
  // await Promise.all(websites.map(site => xAdd(site)));
}

// Read events from a consumer group
export async function xReadGroup(
  consumerGroup: string,
  workerId: string
): Promise<MessageType[] | undefined> {
  // Ensure stream and consumer group exist
  await ensureStreamAndGroup(consumerGroup);

  const res = await client.xReadGroup(
    consumerGroup,
    workerId,
    { key: STREAM_NAME, id: ">" },
    { COUNT: 5 }
  );

  const messages: MessageType[] | undefined = res?.[0]?.messages as MessageType[];
  return messages;
}

// Acknowledge a single event
export async function xAck(consumerGroup: string, eventId: string) {
  await client.xAck(STREAM_NAME, consumerGroup, eventId);
}

// Acknowledge multiple events
export async function xAckBulk(consumerGroup: string, eventIds: string[]) {
  await Promise.all(eventIds.map((eventId) => xAck(consumerGroup, eventId)));
}
