import { Button, Card, Layout, FormLayout } from "@shopify/polaris";
import { useState } from "react";
import _ from "lodash";

export const QuestionCard = ({ question, responseAnswers }) => {
  const [collapseCategory, setCollapseCategory] = useState(false);

  console.log(question.answers.edges);
  const uniqueIds = [];

  const answers = question.answers.edges.filter((element) => {
    const isDuplicate = uniqueIds.includes(element.node.text);

    if (!isDuplicate) {
      uniqueIds.push(element.node.text);

      return true;
    }

    return false;
  });
  console.log(answers);

  if (!collapseCategory) {
    return (
      <Card title={question.title}>
        <FormLayout.Group>
          {question &&
            answers.map((a) => {
              return (
                <Card title={a.node.text} key={a.node.id}>
                  <Layout.Section>
                    <Button
                      primary
                      onClick={(event) => {
                        event.preventDefault();
                        responseAnswers.push(a);
                        setCollapseCategory(true);
                        return responseAnswers;
                      }}
                    >
                      Select
                    </Button>
                  </Layout.Section>
                </Card>
              );
            })}
        </FormLayout.Group>
      </Card>
    );
  } else {
    return (
      <Card title={question.title}>
        <Layout.Section>Answer selected.</Layout.Section>
      </Card>
    );
  }
};
