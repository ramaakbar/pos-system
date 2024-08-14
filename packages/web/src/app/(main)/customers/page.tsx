import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

type Props = {};

export default function Page({}: Props) {
  return (
    <div className="max-height-screen flex flex-col px-4 pt-4">
      <div className="mb-6 flex flex-col justify-between gap-6 md:flex-row">
        <div className="flex flex-col">
          <Heading variant="h2">Customers</Heading>
          <Text>View and manage all customers</Text>
        </div>
      </div>
    </div>
  );
}
