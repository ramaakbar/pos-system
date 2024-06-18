import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function Home() {
  return (
    <main className="px-4">
      <div>
        <Heading className="h1">Hello</Heading>
        <Heading variant="h2">Hello</Heading>
        <Heading variant="h3">Hello</Heading>
        <Heading variant="h4">Hello</Heading>
      </div>
      <div>
        <Text className="">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Incidunt
          aliquid minima aspernatur distinctio quo, quas nobis libero omnis
          eligendi! Nam tenetur voluptas repellendus quod! Velit eum eaque
          reiciendis similique id numquam consequuntur, sit animi atque dolore
          sed, nostrum magni! Vel asperiores, rerum saepe pariatur quisquam
          possimus, impedit minus temporibus accusantium at quidem tempore
          labore dolor et molestiae veritatis ab est iusto ipsam optio corporis
          dolore. Laboriosam, unde magni eligendi necessitatibus natus eaque,
          quibusdam dolorem porro id dolor vero facere quisquam eius, aperiam
          possimus? Est, iste, maiores ullam corporis delectus harum fuga
          quaerat dolorem explicabo aut laborum iure labore, atque commodi!
        </Text>
        <Text as="span" variant="muted">
          this is muted text
        </Text>
        <Button>asdas</Button>
      </div>
    </main>
  );
}
