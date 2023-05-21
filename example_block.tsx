import JSXSlack, { Blocks, Section, Button, Actions } from "jsx-slack";

export const ExampleBlock = (name: string) => {
  return JSXSlack(
    <Blocks>
      <Section>
        Hey there <a href={name} />!
      </Section>
      <Actions>
        {/* https://github.com/yhatt/jsx-slack/blob/main/docs/block-elements.md#-button-button-element */}
        <Button actionId="button_click">Click Me</Button>
      </Actions>
    </Blocks>
  );
};
