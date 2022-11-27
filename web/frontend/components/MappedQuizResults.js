import { Card, FormLayout, Layout } from "@shopify/polaris";
import _ from "lodash";

export const MappedQuizResults = ({ mappedResults }) => {
  console.log(mappedResults);
  return (
    <Layout.Section>
      {mappedResults.map((r) => {
        return (
          <Card title={r.body} key={r.id}>
            <FormLayout>
              <FormLayout.Group>
                {r.answers.edges.map((a) => {
                  return (
                    <Card.Section
                      title={"Q: " + a.node.question.title}
                      key={a.node.id}
                    >
                      <p>{"A: " + a.node.text}</p>
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
