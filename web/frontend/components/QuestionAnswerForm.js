import { useState } from "react";
import { Button, Card, Layout, Caption } from "@shopify/polaris";
import { AnswersList } from "./AnswersList.js";
import { api } from "./../api.js";
import _ from "lodash";

export const QuestionAnswerForm = ({ question, refresh }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState([]);

  const addAnswer = (answer) => {
    setAnswers([...answers, answer]);
  };

  const updateAnswer = (updatedAnswer) => {
    if (!(updatedAnswer.text && updatedAnswer.sequence && updatedAnswer._id)) {
      return;
    }

    const newAnswers = [];

    answers.forEach((answer) => {
      if (answer._id === updatedAnswer._id) {
        newAnswers.push(updatedAnswer);
      } else {
        newAnswers.push(answer);
      }
    });

    setAnswers(newAnswers);
  };

  const removeAnswer = (_id) => {
    setAnswers(answers.filter((a) => a._id !== _id));
  };

  const handleSubmitAnswers = () => {
    setIsSubmitting(true);
    Promise.all(
      answers.map((a) => {
        return api.answer.create(
          {
            answer: {
              text: a.text,
              description: a.desc,
              sequence: parseInt(a.sequence),
              question: { _link: question.id },
            },
          },
          {
            select: {
              id: true,
              text: true,
              description: true,
              sequence: true,
              question: {
                id: true,
                title: true,
                body: true,
                sequence: true,
              },
            },
          }
        );
      })
    )
      .then((result) => {
        console.log(`Create Answers result:`, result);
        setAnswers([]);
        refresh();
      })
      .catch((error) => {
        console.log(`Create Answers error:`, error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <Layout.Section>
      <Card
        sectioned
        title={`Question: ${question.title}`}
        primaryFooterAction={{
          content: "Save answers",
          disabled: !question || isSubmitting,
          loading: isSubmitting,
          onAction: handleSubmitAnswers,
        }}
        secondaryFooterActions={[
          {
            content: "Add answer",
            disabled: !question || isSubmitting,
            onAction: (event) => {
              event.preventDefault();
              const _id = _.uniqueId();
              addAnswer({
                _id,
                text: "",
                description: "",
                sequence: 1,
                question,
              });
            },
          },
        ]}
      >
        {answers.length == 0 && (
          <Layout.Section secondary>
            <Caption>Add answers for the question</Caption>
          </Layout.Section>
        )}
        <AnswersList
          answers={answers}
          updateAnswer={(answer) => updateAnswer(answer)}
          removeAnswer={(id) => removeAnswer(id)}
          question={question}
        />
      </Card>
    </Layout.Section>
  );
};
