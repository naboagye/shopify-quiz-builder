import { Card, FormLayout, Layout } from "@shopify/polaris";
import _ from "lodash";

export const MappedQuizAnswers = ({ mappedAnswers }) => {
  console.log(mappedAnswers);
  return (
    <Layout.Section>
      {mappedAnswers.map((r) => {
        return (
          <Card title={"Question: " + r.node.title} key={r.node.id}>
            <FormLayout>
              <FormLayout.Group>
                {r.node.answers.edges.map((a) => {
                  return (
                    <Card.Section
                      title={"Answer: " + a.node.text}
                      key={r.node.id}
                    >
                      <p>{"Description: " + a.node.description}</p>
                      <br />
                    </Card.Section>
                  );
                })}
              </FormLayout.Group>
            </FormLayout>
            <Layout.Section>
              {r.productSuggestion && (
                <Card.Section
                  title={`Product Suggestion: ` + r.productSuggestion.title}
                ></Card.Section>
              )}
            </Layout.Section>
          </Card>
        );
      })}
    </Layout.Section>
  );
};
