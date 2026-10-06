import type React from "react";
import Header from "@/components/global-header";
import { MessagesCarousel } from "@/components/home/messages-carousel";
import { Text } from "@/components/ui/text";

export default function Home(): React.JSX.Element {
  return (
    <>
      <Header />
      <main className="container mx-auto my-6 flex w-full max-w-5xl flex-col gap-6 px-4 md:my-12 md:gap-12">
        <Text as={"h1"} className="text-center" variant={"h1"}>
          Send Messages like a Ghost. 👻
        </Text>

        <Text className="text-center" variant={"lead"}>
          GhostMsg lets you send anonymous messages that appear out of nowhere.
          Perfect for fun confessions, playful hints, or secret admirers.
        </Text>

        <MessagesCarousel />
      </main>
    </>
  );
}
