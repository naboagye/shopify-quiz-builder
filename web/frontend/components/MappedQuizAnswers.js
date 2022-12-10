import {
  Card,
  FormLayout,
  Layout,
  Icon,
  Tooltip,
  Button,
} from "@shopify/polaris";
import { EditMajor } from "@shopify/polaris-icons";
import _ from "lodash";

export const MappedQuizAnswers = ({ mappedAnswers }) => {
  console.log(mappedAnswers);

  const EditAnswerBtn = () => {
    return (
      <Tooltip content="Edit Answer" dismissOnMouseOut>
        <Icon source={EditMajor} />
      </Tooltip>
    );
  };

  const handleEditAnswer = (id) => {
    return api.answer.update(id, {
      answer: {
        text: a.text,
        description: a.desc,
        sequence: parseInt(a.sequence),
        question: { _link: question.id },
      },
    });
  };

  return (
    <Layout.Section>
      {mappedAnswers.map((r) => {
        return (
          <Card
            title={"Question: " + r.node.title}
            actions={[
              { content: <EditAnswerBtn />, onAction: handleEditAnswer },
            ]}
            key={r.node.id}
          >
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
