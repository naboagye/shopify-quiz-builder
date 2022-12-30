import { Button, Card, FormLayout, Layout, Select } from "@shopify/polaris";
import { useState } from "react";
import { api } from "./../api.js";
import _ from "lodash";

export const ResultMappingForm = ({ quizResult, quiz }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answered, setAnswered] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  //const selectID = "PolarisSelect1";

  const questions = [];
  const questionOptions = quiz.questions.edges.forEach((q, i) => {
    questions.push(q.node);
  });

  const [selectedAnswer, setSelectedAnswer] = useState([]);
  const handleChangeSelectedAnswer = (value, id) => {
    if (
      selectedAnswers.filter(
        (a) => a != value && selectedAnswers.length <= questions.length
      )
    ) {
      setSelectedAnswers([...selectedAnswers, value]);
      setSelectedAnswer(value);
    }
    //setAnswered({ ...answered, [id]: value });
    answered[id] = value;
    setAnswered(answered);
    //console.log(answered);
    //setSelectedAnswers(Object.values(answered));
    console.log(selectedAnswers);
    //console.log(answered[id]);
  };

  const handleSubmitMapping = (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    Promise.all(
      selectedAnswers.map((answer) => {
        const printRecord = async () => {
          console.log(answer);
          const answerRecord = await api.answer.findById(parseInt(answer), {
            select: {
              id: true,
              createdAt: true,
              description: true,
              sequence: true,
              result: {
                id: true,
              },
              state: true,
              text: true,
              question: {
                id: true,
              },
            },
          });
          console.log(answerRecord);
          if (answerRecord.result !== null) {
            return api.answer.create(
              {
                answer: {
                  text: answerRecord.text,
                  sequence: parseInt(answerRecord.sequence),
                  question: { _link: answerRecord.question.id },
                  result: {
                    _link: quizResult.id,
                  },
                },
              },
              {
                select: {
                  id: true,
                  text: true,
                  sequence: true,
                  question: {
                    id: true,
                    title: true,
                    body: true,
                    sequence: true,
                  },
                  result: {
                    id: true,
                    body: true,
                    productSuggestion: {
                      id: true,
                      title: true,
                      product: {
                        title: true,
                      },
                    },
                  },
                },
              }
            );
          } else {
            return api.answer.update(
              parseInt(answer),
              {
                answer: {
                  result: {
                    _link: quizResult.id,
                  },
                },
              },
              {
                select: {
                  id: true,
                  text: true,
                  question: {
                    id: true,
                    title: true,
                  },
                  result: {
                    id: true,
                    body: true,
                    productSuggestion: {
                      id: true,
                      title: true,
                      product: {
                        title: true,
                      },
                    },
                  },
                },
              }
            );
          }
        };

        printRecord();
      })
    )
      .then((result) => {
        console.log(`Update Answers result:`, result);
        setSelectedAnswers([]);
        setAnswered({});
      })
      .catch((error) => {
        console.log(`Update Answers error:`, error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const deleteResult = (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    api.result
      .delete(quizResult.id)
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const sortedQuestions = questions.sort((a, b) => a.sequence - b.sequence);
  return (
    <Card
      sectioned
      title={`Mapping for result ${quizResult.body}`}
      secondaryFooterActions={[
        {
          content: "Delete result",
          destructive: true,
          onClick: deleteResult,
          disabled: !quizResult || isSubmitting,
          loading: isSubmitting,
        },
      ]}
      primaryFooterAction={{
        content: "Save mapping",
        onClick: handleSubmitMapping,
        disabled: !quizResult || isSubmitting,
        loading: isSubmitting,
      }}
    >
      <Layout.Section>
        <FormLayout>
          <FormLayout.Group>
            {sortedQuestions &&
              sortedQuestions.map((q) => {
                const _answers = [];
                q.answers.edges.forEach((a) => {
                  _answers.push({
                    label: a.node.text,
                    value: a.node.id,
                    sequence: a.node.sequence,
                    key: a.node.id,
                  });
                });
                _answers = _answers.sort(function (a, b) {
                  return a.sequence - b.sequence;
                });
                const uniqueIds = [];

                _answers = _answers.filter((element) => {
                  const isDuplicate = uniqueIds.includes(element.label);

                  if (!isDuplicate) {
                    uniqueIds.push(element.label);

                    return true;
                  }

                  return false;
                });
                console.log(_answers);
                return (
                  <Layout.Section key={q.id + quizResult.body}>
                    <Card title={q.title}>
                      <Layout.Section>
                        <Select
                          id={q.title}
                          label={`Answer to map to result ` + quizResult.body}
                          placeholder="Answer"
                          options={_answers}
                          value={answered[q.title]}
                          onChange={handleChangeSelectedAnswer}
                          //disabled={answered[selectID]}
                          requiredIndicator
                        />
                      </Layout.Section>
                    </Card>
                  </Layout.Section>
                );
              })}
          </FormLayout.Group>
        </FormLayout>
      </Layout.Section>
    </Card>
  );
};
